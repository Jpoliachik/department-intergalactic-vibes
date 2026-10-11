"""Foley for "A Higher Frequency": small synthesized effects, written to public/sfx/.

    python3 scripts/sfx.py
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(11)
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)


def t(d):
    return np.arange(int(d * SR)) / SR


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / cutoff) ** 4), n=len(x))


def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


# leader beep: the 1 kHz pip on "2"
tt = t(0.33)
save("beep", np.sin(2 * np.pi * 1000 * tt) * np.minimum(1, np.minimum(tt, 0.33 - tt) / 0.005), 0.5)

# whoosh: filtered noise sweeping up then away
tt = t(0.8)
n = rng.standard_normal(len(tt))
env = np.sin(np.pi * np.clip(tt / 0.8, 0, 1)) ** 2
w = np.zeros_like(n)
for lo, hi, g in ((200, 900, 1.0), (900, 2500, 0.6)):
    w += g * lowpass(n, hi) - g * lowpass(n, lo)
save("whoosh", w * env, 0.6)

# thunk: rubber stamp on paper over a desk
tt = t(0.25)
body = np.sin(2 * np.pi * 95 * tt) * np.exp(-tt * 28)
slap = lowpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 70)
save("thunk", body + 0.7 * slap, 0.85)

# ping: radar return
tt = t(1.4)
save("ping", (np.sin(2 * np.pi * 1320 * tt) + 0.3 * np.sin(2 * np.pi * 2640 * tt)) * np.exp(-tt * 3.5) * np.minimum(1, tt / 0.004), 0.6)

# chime: three glockenspiel notes, up
x = np.zeros(int(1.6 * SR))
for i, f in enumerate((1568, 1976, 2349)):
    tt = t(1.2)
    note = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3.2)
    s = int(i * 0.09 * SR)
    x[s : s + len(note)] += note
save("chime", x, 0.55)

# ding: a single bright bell (the tick on the clipboard, the hat tip)
tt = t(1.0)
save("ding", (np.sin(2 * np.pi * 2093 * tt) + 0.35 * np.sin(2 * np.pi * 5650 * tt) * np.exp(-tt * 9)) * np.exp(-tt * 4), 0.5)

# projector: shutter rattle at 24 fps plus motor hum, 60 s
tt = t(60.0)
clicks = np.zeros_like(tt)
period = SR // 24
for k in range(0, len(tt), period):
    j = k + rng.integers(-40, 40)
    if 0 <= j < len(tt) - 400:
        clicks[j : j + 400] += rng.standard_normal(400) * np.exp(-np.arange(400) / 60)
clicks = lowpass(clicks, 3000) - lowpass(clicks, 400)
hum = 0.25 * np.sin(2 * np.pi * 60 * tt) + 0.1 * np.sin(2 * np.pi * 120 * tt)
save("projector", clicks + hum * 0.4, 0.5)

print("wrote", ", ".join(sorted(p.name for p in OUT.glob("*.wav"))))
