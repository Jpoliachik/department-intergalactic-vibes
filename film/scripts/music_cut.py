"""Score for a short cut, arranged against the cues in its timeline.

Same band and the same moments as the 60s score (logo hit, runaway ostinato and
tape-stop, the searchlight swoop, the JOIN sting, the final chord, the button),
at a quicker tempo, laid on whatever times src/cuts/<name>.json says.

    python3 scripts/music_cut.py cut30   ->  public/cut30/music.wav
"""

import json
import sys
from pathlib import Path

import numpy as np
from orchestra import (
    CH, C, SR, add, brass, crash, glock, hz, master, pizz, render_theremin, root_of, snare, strings, tape_stop, timpani,
    tuba, write_wav,
)

ROOT = Path(__file__).resolve().parent.parent
name = sys.argv[1] if len(sys.argv) > 1 else "cut30"
cut = json.loads((ROOT / f"src/cuts/{name}.json").read_text())
Q = cut["cues"]
DUR = cut["duration"]
N = int(DUR * SR)

BPM = 132
BEAT = 60 / BPM
BAR = 4 * BEAT

orch = np.zeros(N)
perc = np.zeros(N)
button = np.zeros(N)
melody = []


def bars(start, end):
    """Bar start times from start, while a bar still begins before end."""
    t = start
    while t < end - BEAT:
        yield t
        t += BAR


def phrase(t, notes, end):
    for m, beats in notes:
        if t >= end:
            return
        if m is not None:
            melody.append((t, m, min(beats * BEAT, end - t)))
        t += beats * BEAT


# ---------------------------------------------------------------- the countdown and the logo

if Q["logo"] > 0.3:  # a countdown to roll under
    add(perc, 0.05, timpani(hz(36), Q["logo"] - 0.05, roll=True), 0.35)
for m in (48, 55, 60, 64, 67):
    add(orch, Q["logo"], brass(hz(m), 1.0), 0.11)
add(orch, Q["logo"], glock(hz(84)), 0.14)
add(perc, Q["logo"], timpani(hz(36), 1.2), 0.3)

# ---------------------------------------------------------------- title + history: stately, two chords a bar

t0 = Q["logo"] + 0.55
for i, name_ in enumerate(["C", "Am", "F", "G7", "C", "Am"]):
    t = t0 + i * BAR / 2
    if t >= Q["main"] - 0.1:
        break
    tones = CH[name_]
    for m in tones:
        add(orch, t, strings(hz(C + m), BAR / 2 + 0.3), 0.06)
        add(orch, t, brass(hz(C - 12 + m), BAR / 2), 0.03)
    add(orch, t, tuba(hz(root_of(tones)), 0.6), 0.22)
phrase(t0 + BEAT, [(76, 2), (79, 2), (77, 1), (74, 3)], Q["main"])

# ---------------------------------------------------------------- main: oom-pah and pizzicato, until the belt runs away

MAIN = ["C", "Am", "Dm", "G7", "C", "E7", "F", "Fm", "C", "A7", "D7", "G7"]
for i, t in enumerate(bars(Q["main"], Q["endless"] + BAR)):
    tones = CH[MAIN[i % len(MAIN)]]
    root = root_of(tones)
    for beat in range(4):
        tb = t + beat * BEAT
        if tb >= Q["stop"]:
            break
        if beat % 2 == 0:
            add(orch, tb, tuba(hz(root if beat == 0 else root + 7)), 0.26)
        else:
            for m in tones[:3]:
                add(orch, tb, pizz(hz(C + m)), 0.06)
    for k, m in enumerate((tones + tones)[:8]):
        if t + k * BEAT / 2 < Q["endless"]:
            add(orch, t + k * BEAT / 2, pizz(hz(C + 12 + m), 0.3), 0.045)
    for m in tones:
        add(orch, t, strings(hz(C + m), BAR + 0.2), 0.025)
    if i % 2 == 1:
        add(orch, t, glock(hz(C + 24 + tones[1])), 0.06)

MAIN_TUNE = [
    [(79, 2), (76, 1), (79, 1)], [(81, 3), (76, 1)], [(77, 2), (74, 1), (77, 1)], [(79, 4)],
    [(84, 2), (79, 1), (76, 1)], [(80, 3), (83, 1)], [(81, 2), (77, 1), (72, 1)], [(80, 4)],
]
for i, t in enumerate(bars(Q["main"], Q["endless"])):
    phrase(t, MAIN_TUNE[i % len(MAIN_TUNE)], Q["endless"])

# "The work is endless": an ostinato that won't stop speeding up and climbing
t = Q["endless"]
k = 0
span = Q["stop"] - Q["endless"]
while t < Q["stop"]:
    u = (t - Q["endless"]) / span
    m = 72 + int(k * 0.7) % 24
    add(orch, t, pizz(hz(m), 0.2), 0.11)
    add(orch, t, pizz(hz(m - 12), 0.2), 0.06)
    if k % 2 == 0:
        add(perc, t, snare(0.08), 0.03 + 0.05 * u)
    t += max(0.04, 0.2 * (1 - u) ** 1.6)
    k += 1

# ---------------------------------------------------------------- the night sky: soft, searching

soft = Q["join"] - Q["soft"]
for i, name_ in enumerate(["Fmaj7", "Em7", "Dm7", "G7sus"]):
    t = Q["soft"] + i * soft / 4
    tones = CH[name_]
    for m in tones:
        add(orch, t, strings(hz(C + m), soft / 4 + 0.5), 0.08)
    add(orch, t, tuba(hz(root_of(tones)), soft / 4), 0.12)
    add(orch, t + soft / 8, glock(hz(C + 24 + tones[-1]), 1.2), 0.04)
melody += [
    (Q["soft"] + 0.1, 81, Q["rare"] - Q["soft"] - 0.2),
    # the searchlight finds someone: the theremin swoops up and hangs there
    (Q["rare"], 88, (Q["join"] - Q["rare"]) * 0.65),
    (Q["rare"] + (Q["join"] - Q["rare"]) * 0.65, 86, (Q["join"] - Q["rare"]) * 0.3),
]

# ---------------------------------------------------------------- JOIN THE MOVEMENT: sting, then a march

for m in (48, 55, 60, 64, 67, 72):
    add(orch, Q["join"], brass(hz(m), 0.6), 0.1)
add(perc, Q["join"], timpani(hz(36), 1.2), 0.45)
add(perc, Q["join"], crash(1.2), 0.07)

MARCH = ["C", "F", "Am", "D7", "F", "G7"]
march_from = Q["join"] + BAR / 2
for i, t in enumerate(bars(march_from, Q["final"])):
    tones = CH[MARCH[i % len(MARCH)]]
    root = root_of(tones)
    for beat in range(4):
        tb = t + beat * BEAT
        if tb >= Q["final"] - 0.05:
            break
        add(orch, tb, tuba(hz(root if beat % 2 == 0 else root + 7)), 0.3)
        add(perc, tb, snare(), 0.12 if beat % 2 else 0.05)
        if beat % 2:
            for m in tones[:3]:
                add(orch, tb, brass(hz(C + m), 0.3), 0.05)
    for m in tones:
        add(orch, t, strings(hz(C + 12 + m), BAR + 0.2), 0.03)
MARCH_TUNE = [[(84, 2), (79, 2)], [(81, 2), (84, 2)], [(84, 1), (83, 1), (81, 2)], [(78, 2), (81, 2)], [(81, 1), (79, 1), (77, 1), (81, 1)], [(79, 3), (83, 1)]]
for i, t in enumerate(bars(march_from, Q["final"])):
    phrase(t, MARCH_TUNE[i % len(MARCH_TUNE)], Q["final"])

# ---------------------------------------------------------------- the end card, and the button

hold = Q["finalEnd"] - Q["final"]
tones = CH["C69"]
for m in tones:
    add(orch, Q["final"], strings(hz(C + m), hold + 0.6), 0.08)
    add(orch, Q["final"], brass(hz(C - 12 + m), min(3.0, hold)), 0.05)
add(orch, Q["final"], tuba(hz(36), min(2.5, hold)), 0.3)
add(perc, Q["final"], timpani(hz(36), min(3.0, hold)), 0.35)
for i, m in enumerate((0, 4, 7, 12)):
    add(orch, Q["final"] + 0.12 * i, glock(hz(84 + m), 2.0), 0.07)
melody += [(Q["final"], 84, BEAT * 2), (Q["final"] + BEAT * 2, 91, hold - BEAT * 2)]

for m in (48, 60, 64, 67, 72):
    add(button, Q["button"], pizz(hz(m), 0.4), 0.11)
add(button, Q["button"], tuba(hz(36), 0.3), 0.3)
add(button, Q["button"], glock(hz(96), 0.6), 0.1)

# ---------------------------------------------------------------- mix

lead = render_theremin(melody, N, fade_at=Q["finalEnd"] - 0.05)
mix = orch + perc + 0.085 * lead
tape_stop(mix, Q["stop"], Q["soft"])
mix = master(mix, DUR, fade_end=Q["finalEnd"], button=button)

out = ROOT / "public" / cut["music"]
out.parent.mkdir(parents=True, exist_ok=True)
write_wav(out, mix)
print(f"wrote {out}  ({DUR:.0f}s, {BPM} bpm)")
