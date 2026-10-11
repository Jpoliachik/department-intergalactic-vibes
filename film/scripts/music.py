"""Score for "A Higher Frequency" — a 60s mid-century educational-film cue.

Cheerful pocket orchestra (pizzicato strings, brass, oom-pah tuba, glockenspiel,
snare) with a theremin line on top, then pushed through an optical-soundtrack
chain: mono, band-limited, gently saturated, with crackle and hiss.

Grid: 120 bpm, one bar = 2 s, so bars land on the film's cues (10s, 42s, 54s).

    python3 scripts/music.py   ->  public/music.wav
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 60.0
BAR = 2.0
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, d, s, r):
    t = np.arange(n) / SR
    total = n / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where(t >= a + d, s, e)
    rel = np.clip((total - t) / max(r, 1e-4), 0, 1)
    return e * rel


def harmonic(freq, dur, amps, vib=0.0, vib_rate=5.0, detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + vib * np.sin(2 * np.pi * vib_rate * t) + detune)
    ph = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros(n)
    for k, a in enumerate(amps, start=1):
        if freq * k < 9000:
            out += a * np.sin(k * ph)
    return out


def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]


# ---------------------------------------------------------------- instruments

def pizz(freq, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, 9):
        out += (0.8 ** k) * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (9 + 4 * k))
    return out * np.minimum(1, t / 0.003)


def brass(freq, dur):
    amps = [1, 0.75, 0.55, 0.4, 0.28, 0.18, 0.12, 0.08]
    s = harmonic(freq, dur, amps, vib=0.004, vib_rate=5.5)
    return s * env_adsr(len(s), 0.06, 0.15, 0.75, 0.18)


def strings(freq, dur):
    amps = [1 / k for k in range(1, 10)]
    s = sum(harmonic(freq, dur, amps, vib=0.003, vib_rate=5.8, detune=d) for d in (-0.003, 0, 0.0035))
    return s / 3 * env_adsr(len(s), 0.35, 0.2, 0.85, 0.5)


def tuba(freq, dur=0.32):
    s = harmonic(freq, dur, [1, 0.6, 0.3, 0.15])
    return s * env_adsr(len(s), 0.015, 0.08, 0.6, 0.12)


def glock(freq, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * freq * t) * np.exp(-t * 3)
    out += 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 8)
    out += 0.2 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 14)
    return out


def snare(dur=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.convolve(noise, [1, -0.6], mode="same")
    return (0.8 * noise * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30))


def timpani(freq, dur=1.6, roll=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 1.5 * t)
    if roll:
        am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t))
        return body * am * np.minimum(1, t / dur * 1.3) * np.exp(-np.maximum(0, t - dur * 0.8) * 8)
    return body * np.exp(-t * 2.5)


# ---------------------------------------------------------------- harmony

C = 60
CH = {
    "C": [0, 4, 7], "C6": [0, 4, 7, 9], "Am": [9, 12, 16], "F": [5, 9, 12], "Fm": [5, 8, 12],
    "G": [7, 11, 14], "G7": [7, 11, 14, 17], "Dm": [2, 5, 9], "E7": [4, 8, 11, 14],
    "A7": [9, 13, 16, 19], "D7": [2, 6, 9, 12], "Fmaj7": [5, 9, 12, 16],
    "Em7": [4, 7, 11, 14], "Dm7": [2, 5, 9, 12], "G7sus": [7, 12, 14, 17], "C69": [0, 4, 7, 9, 14],
}

# (bar, chord, section) — one chord per bar; march bars split in two.
PLAN = [(0, "C", "fanfare")]
PLAN += [(b, c, "title") for b, c in zip(range(1, 5), ["C", "Am", "F", "G7"])]
MAIN = ["C", "Am", "Dm", "G7", "C", "E7", "F", "Fm", "C", "A7", "D7", "G7"]
PLAN += [(b, c, "main") for b, c in zip(range(5, 17), MAIN)]
PLAN += [(b, c, "soft") for b, c in zip(range(17, 21), ["Fmaj7", "Em7", "Dm7", "G7sus"])]
PLAN += [(b, c, "march") for b, c in zip(range(21, 27), ["C", "F", "Am", "D7", "F", "G7"])]
PLAN += [(27, "C69", "finale")]

orch = np.zeros(N)
lead = np.zeros(N)
perc = np.zeros(N)

# Fanfare: timpani roll into a brass C chord
add(perc, 0.0, timpani(hz(36), 2.0, roll=True), 0.35)
for m in (48, 55, 60, 64, 67):
    add(orch, 0.9, brass(hz(m), 1.4), 0.10)
add(orch, 0.9, glock(hz(84)), 0.12)

for bar, name, sec in PLAN:
    t0 = bar * BAR
    tones = CH[name]
    root = C + tones[0] - 12 if tones[0] < 7 else C + tones[0] - 24
    if sec == "title":
        for m in tones:
            add(orch, t0, strings(hz(C + m), BAR + 0.3), 0.07)
            add(orch, t0, brass(hz(C - 12 + m), BAR), 0.035)
        add(orch, t0, tuba(hz(root), 1.2), 0.22)
        add(orch, t0 + 1.0, tuba(hz(root + 7), 0.8), 0.15)
    elif sec == "main":
        # oom-pah + pizzicato arpeggio + a glock sparkle on the downbeat every other bar
        for beat in range(4):
            tb = t0 + beat * BEAT
            if beat % 2 == 0:
                add(orch, tb, tuba(hz(root if beat == 0 else root + 7)), 0.26)
            else:
                for m in tones[:3]:
                    add(orch, tb, pizz(hz(C + m)), 0.06)
        for i, m in enumerate((tones + tones)[:8]):
            add(orch, t0 + i * BEAT / 2, pizz(hz(C + 12 + m), 0.3), 0.045)
        for m in tones:
            add(orch, t0, strings(hz(C + m), BAR + 0.2), 0.025)
        if bar % 2 == 1:
            add(orch, t0, glock(hz(C + 24 + tones[1])), 0.06)
    elif sec == "soft":
        for m in tones:
            add(orch, t0, strings(hz(C + m), BAR + 0.6), 0.08)
        add(orch, t0, tuba(hz(root), 1.8), 0.12)
        add(orch, t0 + 1.0, glock(hz(C + 24 + tones[-1]), 1.5), 0.04)
    elif sec == "march":
        for beat in range(4):
            tb = t0 + beat * BEAT
            add(orch, tb, tuba(hz(root if beat % 2 == 0 else root + 7)), 0.3)
            add(perc, tb, snare(), 0.12 if beat % 2 else 0.05)
            if beat % 2:
                for m in tones[:3]:
                    add(orch, tb, brass(hz(C + m), 0.35), 0.05)
        add(perc, t0 + 1.75, snare(0.12), 0.06)
        for m in tones:
            add(orch, t0, strings(hz(C + 12 + m), BAR + 0.2), 0.03)
        add(orch, t0, brass(hz(C + tones[0] + 12), 0.9), 0.05)
    elif sec == "finale":
        for m in tones:
            add(orch, t0, strings(hz(C + m), 5.2), 0.08)
            add(orch, t0, brass(hz(C - 12 + m), 3.0), 0.05)
        add(orch, t0, tuba(hz(36), 2.5), 0.3)
        add(perc, t0, timpani(hz(36), 3.0), 0.35)
        for i, m in enumerate((0, 4, 7, 12)):
            add(orch, t0 + 0.12 * i, glock(hz(84 + m), 2.0), 0.07)

# ---------------------------------------------------------------- theremin

# Melody as (start_s, midi, len_s). Portamento between notes is what sells it.
MELODY = []


def phrase(bar, notes, step=BEAT * 2):
    t = bar * BAR
    for m, beats in notes:
        if m is not None:
            MELODY.append((t, m, beats * BEAT))
        t += beats * BEAT


# title: two long, eerie notes under the narrator's first line
phrase(3, [(76, 4), (79, 3), (77, 1)])
phrase(4, [(74, 4)])
# main theme, 12 bars — bouncy, singable
phrase(5, [(79, 2), (76, 1), (79, 1)])
phrase(6, [(81, 3), (76, 1)])
phrase(7, [(77, 2), (74, 1), (77, 1)])
phrase(8, [(79, 4)])
phrase(9, [(84, 2), (79, 1), (76, 1)])
phrase(10, [(80, 3), (83, 1)])
phrase(11, [(81, 2), (77, 1), (72, 1)])
phrase(12, [(80, 4)])
phrase(13, [(79, 2), (76, 1), (72, 1)])
phrase(14, [(73, 2), (76, 1), (79, 1)])
phrase(15, [(78, 2), (81, 2)])
phrase(16, [(79, 3), (None, 1)])
# soft: theremin alone up top, slow and searching
phrase(17, [(81, 3), (79, 1)])
phrase(18, [(83, 4)])
phrase(19, [(84, 2), (81, 2)])
phrase(20, [(79, 3), (86, 1)])
# march: proud, plain
phrase(21, [(84, 2), (79, 2)])
phrase(22, [(81, 2), (84, 2)])
phrase(23, [(84, 1), (83, 1), (81, 2)])
phrase(24, [(78, 2), (81, 2)])
phrase(25, [(81, 1), (79, 1), (77, 1), (81, 1)])
phrase(26, [(79, 3), (83, 1)])
# finale: glide up to high C and hang there
phrase(27, [(84, 2), (91, 4.5)])


def render_theremin():
    f = np.zeros(N)
    amp = np.zeros(N)
    for start, m, length in MELODY:
        i, j = int(start * SR), min(N, int((start + length) * SR))
        f[i:j] = hz(m)
        amp[i:j] = 1.0
    # fill gaps with previous pitch so silent stretches still glide in from somewhere
    last = hz(76)
    for k in range(N):
        if f[k] == 0:
            f[k] = last
        else:
            last = f[k]
    # portamento: one-pole smoothing on log-frequency
    lf = np.log(f)
    a = np.exp(-1 / (0.07 * SR))
    sm = np.empty_like(lf)
    acc = lf[0]
    for k in range(N):
        acc = a * acc + (1 - a) * lf[k]
        sm[k] = acc
    t = np.arange(N) / SR
    vib_depth = 0.006 + 0.004 * np.sin(2 * np.pi * 0.15 * t) ** 2
    freq = np.exp(sm) * (1 + vib_depth * np.sin(2 * np.pi * 5.6 * t))
    # amplitude: smooth swells, not hard edges
    b = np.exp(-1 / (0.06 * SR))
    env = np.empty(N)
    acc = 0.0
    for k in range(N):
        acc = b * acc + (1 - b) * amp[k]
        env[k] = acc
    ph = 2 * np.pi * np.cumsum(freq) / SR
    tone = np.sin(ph) + 0.08 * np.sin(2 * ph) + 0.03 * np.sin(3 * ph)
    # end fade
    env *= np.clip((DUR - 0.4 - t) / 3.0, 0, 1)
    return tone * env


lead = render_theremin()

# ---------------------------------------------------------------- master: optical soundtrack


def bandlimit(x, lo, hi):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4) / np.sqrt(1 + (fr / hi) ** 4)
    return np.fft.irfft(X * g, n=len(x))


mix = orch + perc + 0.085 * lead
if __import__("os").environ.get("STEMS"):
    for nm, sg in (("orch", orch), ("perc", perc), ("lead", 0.085 * lead)):
        print(nm, " ".join(f"{20*np.log10(np.sqrt((sg[i*SR*4:(i+1)*SR*4]**2).mean())+1e-9):.0f}" for i in range(15)))
t = np.arange(N) / SR
mix *= np.clip((DUR - t) / 1.2, 0, 1)
mix = bandlimit(mix, 110, 5200)
mix = mix / np.percentile(np.abs(mix), 99.9) * 0.7
mix = np.tanh(mix * 1.4) / 1.4  # gentle valve-amp warmth, not a limiter

# wow & flutter: tiny time-varying resample
wow = 0.0016 * np.sin(2 * np.pi * 0.55 * t) + 0.0006 * np.sin(2 * np.pi * 7.3 * t)
idx = np.clip(np.arange(N) + np.cumsum(wow) * 2, 0, N - 1)
mix = np.interp(idx, np.arange(N), mix)

hiss = bandlimit(rng.standard_normal(N), 1500, 7000) * 0.006
crackle = np.zeros(N)
pops = rng.choice(N, size=int(DUR * 9), replace=False)
crackle[pops] = rng.uniform(-1, 1, len(pops)) * rng.uniform(0.05, 0.35, len(pops))
crackle = np.convolve(crackle, np.exp(-np.arange(60) / 8), mode="same")
mix = mix + hiss + 0.25 * bandlimit(crackle, 300, 6000)

mix = mix / np.max(np.abs(mix)) * 0.89
pcm = (mix * 32767).astype(np.int16)

out = Path(__file__).resolve().parent.parent / "public" / "music.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {out}  ({DUR:.0f}s)")
