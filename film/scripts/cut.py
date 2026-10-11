"""Build a short cut of the film from the 60s design.

The scenes are designed against the 60s timeline in src/copy.ts. A cut doesn't
redraw anything: it tightens the narration, then plays each scene on a warped
clock so its key moment still lands on the word that calls it.

    python3 scripts/cut.py            # the 30s cut

Reads   public/voice/*.mp3            the ElevenLabs takes (one per NARRATION line)
Writes  public/cut30/narration.wav    tightened narration, broadcast tone
        src/cuts/cut30.json           timeline: scenes, warp anchors, subtitles, cues

Then `npm run music:30` scores it, and `npm run render:30` renders it.
"""

import hashlib
import json
import os
import re
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
NAME = "cut30"
DURATION = 30.0
SR = 44100

# Pace. The 60s takes are delivered at a stately clip; the short cut is a newsreel.
# The pace is solved for: whatever speed lands the last word at SPEECH_ENDS, so a
# new voice (longer or shorter takes) still fits. Some lines keep a little weight.
SPEECH_ENDS = 28.4  # leaves the fine print time to be read
WEIGHT = {1: 0.85, 10: 0.88}  # "That someone is us." and the last line run slower than the rest
MAX_TEMPO = 1.6
GAP = 0.07  # between lines
GAP_AFTER = {1: 0.18, 7: 0.5}  # a beat after the punchline; room for the JOIN sting before "Requirements"
FIRST_LINE_AT = 0.42

copy = (ROOT / "src/copy.ts").read_text()


def ts_block(name):
    i = copy.index(f"export const {name}")
    return copy[i : copy.index("};", i) if name != "NARRATION" else copy.index("];", i)]


SCENES = {k: (float(a), float(b)) for k, a, b in re.findall(r"(\w+): \[([\d.]+), ([\d.]+)\]", ts_block("SCENES"))}
BEATS = {k: float(v) for k, v in re.findall(r"(\w+): ([\d.]+),", ts_block("BEATS"))}
LINES = [
    eval(m)  # plain single-quoted literals with \u escapes
    for m in re.findall(r"text: ('(?:[^'\\]|\\.)*')", ts_block("NARRATION"))
]
# the takes for the current voice: voice.mjs names them <line>-<sha1(voice|model|text)[:10]>.mp3
voice_src = (ROOT / "scripts/voice.mjs").read_text()
VOICE = os.environ.get("ELEVENLABS_VOICE_ID") or re.search(r"ELEVENLABS_VOICE_ID \?\? '([^']+)'", voice_src).group(1)
MODEL = os.environ.get("ELEVENLABS_MODEL") or re.search(r"ELEVENLABS_MODEL \?\? '([^']+)'", voice_src).group(1)
SPEED = float(os.environ.get("VOICE_SPEED", "1.2"))


def take_set(folder, key):
    return [ROOT / "public/voice" / folder / f"{i:02d}-{hashlib.sha1(key(text).encode()).hexdigest()[:10]}.mp3" for i, text in enumerate(LINES)]


# prefer takes voiced fast for this cut (`VOICE_FOR=cut30 npm run voice`); else the 60s takes, sped up more
takes = take_set(NAME, lambda text: f"{VOICE}|{MODEL}|{SPEED}|{text}")
if not all(t.exists() for t in takes):
    takes = take_set("", lambda text: f"{VOICE}|{MODEL}|{text}")
missing = [t.name for t in takes if not t.exists()]
assert not missing, f"no take for {missing} in voice {VOICE} — run `npm run voice` first"
print(f"takes: {takes[0].parent.relative_to(ROOT)}")


def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def read(path):
    with wave.open(str(path)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768


def phrases(x, min_gap=0.07, thresh=0.012):
    """Start/end (s) of each spoken phrase, split at pauses."""
    hop = SR // 100
    e = np.array([np.sqrt((x[i : i + hop] ** 2).mean()) for i in range(0, len(x), hop)])
    on = e > thresh
    out, start, quiet = [], None, 0
    for i, v in enumerate(on):
        if v:
            if start is None:
                start = i
            quiet = 0
        elif start is not None:
            quiet += 1
            if quiet * hop / SR >= min_gap:
                out.append((start * hop / SR, (i - quiet + 1) * hop / SR))
                start, quiet = None, 0
    if start is not None:
        out.append((start * hop / SR, len(on) * hop / SR))
    # breaths and clicks aren't phrases
    return [(a, b) for a, b in out if b - a >= 0.12]


# ---------------------------------------------------------------- tighten each take

tmp = Path(tempfile.mkdtemp())

# pass 1: trim head and tail and shorten every internal pause
trimmed = []
for i, take in enumerate(takes):
    out = tmp / f"{i:02d}-trim.wav"
    ff(
        "-i", str(take), "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,"
        "silenceremove=stop_periods=-1:stop_threshold=-45dB:stop_duration=0.12:stop_silence=0.08,"
        f"aresample={SR}",
        "-ac", "1", str(out),
    )
    trimmed.append((out, len(read(out)) / SR))

# solve the pace: sum(d_i / (base * w_i)) + gaps = SPEECH_ENDS - FIRST_LINE_AT
gaps = sum(GAP_AFTER.get(i, GAP) for i in range(len(LINES) - 1))
base = sum(d / WEIGHT.get(i, 1.0) for i, (_, d) in enumerate(trimmed)) / (SPEECH_ENDS - FIRST_LINE_AT - gaps)
base = max(1.0, base)
assert base <= MAX_TEMPO, f"would need {base:.2f}x to fit — too fast to follow; trim copy or lengthen the cut"
print(f"pace: {base:.2f}x")

# pass 2: speed up (pitch kept), lay end to end
lines = []
t = FIRST_LINE_AT
for i, ((src, _), text) in enumerate(zip(trimmed, LINES)):
    out = tmp / f"{i:02d}.wav"
    tempo = base * WEIGHT.get(i, 1.0)
    ff("-i", str(src), "-af", f"atempo={tempo:.4f}", str(out))
    x = read(out)
    dur = len(x) / SR
    lines.append({"i": i, "text": text, "file": out, "from": round(t, 3), "to": round(t + dur, 3), "phrases": [(round(t + a, 3), round(t + b, 3)) for a, b in phrases(x)]})
    t += dur + GAP_AFTER.get(i, GAP)

end_of_speech = lines[-1]["to"]
print(f"narration: {lines[0]['from']:.2f}s → {end_of_speech:.2f}s")
assert end_of_speech <= SPEECH_ENDS + 0.05, f"narration runs to {end_of_speech:.2f}s — speed up TEMPO or trim gaps"

L = lambda i: lines[i]  # noqa: E731


def word_at(i, words):
    """When `words` (a substring of line i) is spoken.

    Estimated from where it sits in the line, then snapped to the nearest pause the
    voice actually took — so anchors survive a change of voice or delivery."""
    ln = lines[i]
    frac = ln["text"].index(words) / len(ln["text"])
    guess = ln["from"] + frac * (ln["to"] - ln["from"])
    starts = [a for a, _ in ln["phrases"]]
    best = min(starts, key=lambda a: abs(a - guess))
    return best if abs(best - guess) < 0.4 else guess


# ---------------------------------------------------------------- the cut: scene boundaries, in cut time

final_end = end_of_speech + 0.25
cut = {
    "leader": (0.0, 0.0),  # no countdown in a short cut: open on the logo
    "presents": (0.0, 0.6),
    "title": (0.6, 1.6),
    "history": (1.6, L(1)["from"] - 0.15),  # three eras on "...someone has been watching the vibes"
    "us": (L(1)["from"] - 0.15, L(2)["from"] - 0.1),
    "officer": (L(2)["from"] - 0.1, L(3)["from"] - 0.05),
    "cosmos": (L(3)["from"] - 0.05, L(4)["from"] - 0.1),
    "headline": (L(4)["from"] - 0.1, word_at(4, "Calibrations") - 0.05),
    "calibrate": (word_at(4, "Calibrations") - 0.05, L(5)["from"] - 0.1),
    "conveyor": (L(5)["from"] - 0.1, L(6)["from"] - 0.1),
    "search": (L(6)["from"] - 0.1, L(8)["from"] - 0.5),
    "join": (L(8)["from"] - 0.5, word_at(8, "a steady") - 0.08),  # holds through "Requirements are simple:"
    "requirements": (word_at(8, "a steady") - 0.08, L(9)["from"] - 0.1),
    "radar": (L(9)["from"] - 0.1, L(10)["from"] - 0.1),
    "final": (L(10)["from"] - 0.1, final_end),
    "finePrint": (final_end, DURATION),
}
# contiguous, in order, covering the whole cut
keys = list(SCENES)
assert list(cut) == keys, "scene order must match copy.ts"
for a, b in zip(keys, keys[1:]):
    assert abs(cut[a][1] - cut[b][0]) < 1e-6, (a, b)
for k, (a, b) in cut.items():
    assert b == a or b > a + 0.2, f"{k} is too short (a scene is either dropped, at zero length, or at least 0.2s)"

# ---------------------------------------------------------------- warp anchors: (cut-local s, design-local s)
# A scene plays its design on a piecewise-linear clock through these points, so the
# moment a beat was drawn for lands on the word that calls it now.


def design_local(scene, t60):
    return round(t60 - SCENES[scene][0], 3)


def cut_local(scene, t):
    return round(t - cut[scene][0], 3)


def last_phrase_end(i):
    return lines[i]["phrases"][-1][1]


beats_cut = {
    "hatTip": ("us", L(1)["from"] + 0.3),
    "hammock": ("cosmos", word_at(3, "so you")),
    "readings": ("calibrate", word_at(4, "Readings")),
    "endless": ("conveyor", word_at(5, "The work is endless")),
    "rare": ("search", L(7)["from"]),
    "pulse": ("requirements", word_at(8, "a steady")),
    "eye": ("requirements", word_at(8, "a discerning")),
    "hum": ("requirements", word_at(8, "no fear")),
    "found": ("radar", word_at(9, "we will find")),
    "logged": ("final", last_phrase_end(10) - 0.42),
}

# extra holds: (scene, cut-local s, design-local s)
HOLDS = [
    ("title", 0.45, 1.9),  # the letters land fast, then the card holds
]
# where in its design a scene starts, if not at the top
START = {
    "presents": 0.75,  # frame 0 is the thumbnail: open with the mark already up
}

anchors = {}
for k in keys:
    a0, a1 = cut[k]
    d0, d1 = SCENES[k]
    if a1 == a0:
        continue  # dropped from this cut
    pts = [(0.0, START.get(k, 0.0))] + [(c, d) for scene, c, d in HOLDS if scene == k]
    for beat, (scene, t) in beats_cut.items():
        if scene == k:
            pts.append((cut_local(k, t), design_local(k, BEATS[beat])))
    pts.append((round(a1 - a0, 3), round(d1 - d0, 3)))
    pts.sort()
    assert all(p[0] < q[0] and p[1] < q[1] for p, q in zip(pts, pts[1:])), (k, pts)
    anchors[k] = pts

# the history pan and the officer's tick are drawn on frames, not beats; give them room
# by holding the design's opening for the cut's opening (no extra anchors needed — the
# piecewise clock is linear there).

# ---------------------------------------------------------------- narration track

mix_inputs, chains = [], []
for n, ln in enumerate(lines):
    mix_inputs += ["-i", str(ln["file"])]
    chains.append(f"[{n}:a]adelay={int(ln['from'] * 1000)}:all=1[v{n}]")
mix = "".join(f"[v{n}]" for n in range(len(lines))) + f"amix=inputs={len(lines)}:normalize=0[mix]"
tone = (
    "[mix]highpass=f=160,lowpass=f=5200,equalizer=f=2400:t=q:w=1.2:g=3,"
    "acompressor=threshold=-20dB:ratio=3:attack=8:release=120,aecho=0.8:0.5:28:0.12,"
    f"apad,atrim=0:{DURATION},loudnorm=I=-16:TP=-1.5[out]"
)
(ROOT / f"public/{NAME}").mkdir(parents=True, exist_ok=True)
ff(*mix_inputs, "-filter_complex", ";".join(chains + [mix, tone]), "-map", "[out]", "-ac", "1", "-ar", str(SR), str(ROOT / f"public/{NAME}/narration.wav"))

# ---------------------------------------------------------------- the timeline file

cues = {
    "logo": cut["presents"][0],  # 0: the fanfare is the first frame
    "titleEnd": cut["title"][1],
    "main": cut["us"][0],
    "endless": beats_cut["endless"][1],
    "stop": cut["search"][0] - 0.38,
    "soft": cut["search"][0],
    "rare": beats_cut["rare"][1],
    "join": cut["join"][0],
    "final": cut["final"][0],
    "finalEnd": cut["finePrint"][0],
    "button": cut["finePrint"][0] + 0.3,
}
timeline = {
    "name": NAME,
    "duration": DURATION,
    "narration": f"{NAME}/narration.wav",
    "music": f"{NAME}/music.wav",
    "scenes": {k: [round(a, 3), round(b, 3)] for k, (a, b) in cut.items()},
    "anchors": anchors,
    "lines": [{"from": ln["from"], "to": round(ln["to"] + 0.12, 3), "text": ln["text"]} for ln in lines],
    "cues": {k: round(v, 3) for k, v in cues.items()},
}
(ROOT / "src/cuts").mkdir(exist_ok=True)
(ROOT / f"src/cuts/{NAME}.json").write_text(json.dumps(timeline, indent="\t") + "\n")

for k in keys:
    a, b = cut[k]
    d = SCENES[k][1] - SCENES[k][0]
    speed = f"×{d / (b - a):.2f}" if b > a else "dropped"
    print(f"  {k:13s} {a:6.2f} → {b:6.2f}  ({b - a:4.2f}s, design {d:.1f}s, {speed})")
print(f"wrote public/{NAME}/narration.wav and src/cuts/{NAME}.json")
