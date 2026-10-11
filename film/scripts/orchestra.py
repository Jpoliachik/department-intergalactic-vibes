"""The pocket orchestra, shared by every cut's score.

Instruments are additive-synthesis sketches of a 1950s educational-film band:
pizzicato strings, brass, tuba, glockenspiel, snare, timpani, and a theremin.
`master()` runs a mix through an optical-soundtrack chain.
"""

import wave

import numpy as np

SR = 44100
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
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]


# ---------------------------------------------------------------- instruments


def pizz(freq, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(1, 9):
        out += (0.8**k) * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (9 + 4 * k))
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
    return 0.8 * noise * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)


def timpani(freq, dur=1.6, roll=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 1.5 * t)
    if roll:
        am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t))
        return body * am * np.minimum(1, t / dur * 1.3) * np.exp(-np.maximum(0, t - dur * 0.8) * 8)
    return body * np.exp(-t * 2.5)


def crash(dur=1.6):
    n = int(dur * SR)
    c = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.2)
    return np.convolve(c, [1, -0.95], mode="same")


# ---------------------------------------------------------------- harmony

C = 60
CH = {
    "C": [0, 4, 7], "C6": [0, 4, 7, 9], "Am": [9, 12, 16], "F": [5, 9, 12], "Fm": [5, 8, 12],
    "G": [7, 11, 14], "G7": [7, 11, 14, 17], "Dm": [2, 5, 9], "E7": [4, 8, 11, 14],
    "A7": [9, 13, 16, 19], "D7": [2, 6, 9, 12], "Fmaj7": [5, 9, 12, 16],
    "Em7": [4, 7, 11, 14], "Dm7": [2, 5, 9, 12], "G7sus": [7, 12, 14, 17], "C69": [0, 4, 7, 9, 14],
}


def root_of(tones):
    return C + tones[0] - 12 if tones[0] < 7 else C + tones[0] - 24


# ---------------------------------------------------------------- the theremin


def render_theremin(melody, n, fade_at):
    """melody: [(start_s, midi, len_s)]. Portamento between notes is what sells it."""
    f = np.zeros(n)
    amp = np.zeros(n)
    for start, m, length in melody:
        i, j = int(start * SR), min(n, int((start + length) * SR))
        f[i:j] = hz(m)
        amp[i:j] = 1.0
    # fill gaps with previous pitch so silent stretches still glide in from somewhere
    last = hz(76)
    for k in range(n):
        if f[k] == 0:
            f[k] = last
        else:
            last = f[k]
    # portamento: one-pole smoothing on log-frequency
    lf = np.log(f)
    a = np.exp(-1 / (0.07 * SR))
    sm = np.empty_like(lf)
    acc = lf[0]
    for k in range(n):
        acc = a * acc + (1 - a) * lf[k]
        sm[k] = acc
    t = np.arange(n) / SR
    vib_depth = 0.006 + 0.004 * np.sin(2 * np.pi * 0.15 * t) ** 2
    freq = np.exp(sm) * (1 + vib_depth * np.sin(2 * np.pi * 5.6 * t))
    # amplitude: smooth swells, not hard edges
    b = np.exp(-1 / (0.06 * SR))
    env = np.empty(n)
    acc = 0.0
    for k in range(n):
        acc = b * acc + (1 - b) * amp[k]
        env[k] = acc
    ph = 2 * np.pi * np.cumsum(freq) / SR
    tone = np.sin(ph) + 0.08 * np.sin(2 * ph) + 0.03 * np.sin(3 * ph)
    env *= np.clip((fade_at - t) / 1.5, 0, 1)
    return tone * env


# ---------------------------------------------------------------- master: optical soundtrack


def bandlimit(x, lo, hi):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4) / np.sqrt(1 + (fr / hi) ** 4)
    return np.fft.irfft(X * g, n=len(x))


def tape_stop(mix, start, end):
    """Playback slows to nothing between start and end (s)."""
    n = len(mix)
    a, b = int(start * SR), int(end * SR)
    u = np.arange(b - a) / (b - a)
    pos = a + np.cumsum((1 - u) ** 1.3)
    mix[a:b] = np.interp(pos, np.arange(n), mix) * (1 - u**3)


def master(mix, dur, fade_end, button=None):
    n = len(mix)
    t = np.arange(n) / SR
    mix = mix * np.clip((fade_end - t) / 0.9, 0, 1)
    if button is not None:
        mix = mix + button
    mix = bandlimit(mix, 110, 5200)
    mix = mix / np.percentile(np.abs(mix), 99.9) * 0.7
    mix = np.tanh(mix * 1.4) / 1.4  # gentle valve-amp warmth, not a limiter

    # wow & flutter: tiny time-varying resample
    wow = 0.0016 * np.sin(2 * np.pi * 0.55 * t) + 0.0006 * np.sin(2 * np.pi * 7.3 * t)
    idx = np.clip(np.arange(n) + np.cumsum(wow) * 2, 0, n - 1)
    mix = np.interp(idx, np.arange(n), mix)

    hiss = bandlimit(rng.standard_normal(n), 1500, 7000) * 0.006
    crackle = np.zeros(n)
    pops = rng.choice(n, size=int(dur * 9), replace=False)
    crackle[pops] = rng.uniform(-1, 1, len(pops)) * rng.uniform(0.05, 0.35, len(pops))
    crackle = np.convolve(crackle, np.exp(-np.arange(60) / 8), mode="same")
    mix = mix + hiss + 0.25 * bandlimit(crackle, 300, 6000)
    return mix / np.max(np.abs(mix)) * 0.89


def write_wav(path, mix):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
