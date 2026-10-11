"""Score for "A Higher Frequency" — a 60s mid-century educational-film cue.

Cheerful pocket orchestra (pizzicato strings, brass, oom-pah tuba, glockenspiel,
snare) with a theremin line on top, then pushed through an optical-soundtrack
chain: mono, band-limited, gently saturated, with crackle and hiss.

Grid: 120 bpm, one bar = 2 s, so bars land on the film's cues (10s, 42s, 54s).

    python3 scripts/music.py   ->  public/music.wav
"""

from pathlib import Path

import numpy as np
from orchestra import (
    CH, C, SR, add, brass, crash, glock, hz, master, pizz, render_theremin, root_of, snare, strings, tape_stop, timpani,
    tuba, write_wav,
)

DUR = 60.0
BAR = 2.0
BEAT = 0.5
N = int(SR * DUR)

# (bar, chord, section) — one chord per bar; march bars split in two.
PLAN = [(0, "C", "fanfare")]
PLAN += [(b, c, "title") for b, c in zip(range(1, 5), ["C", "Am", "F", "G7"])]
MAIN = ["C", "Am", "Dm", "G7", "C", "E7", "F", "Fm", "C", "A7", "D7", "G7"]
PLAN += [(b, c, "main") for b, c in zip(range(5, 17), MAIN)]
# bar 17 (34-35s) belongs to the runaway conveyor; the soft section starts on the cut at 35s (below)
PLAN += [(b, c, "march") for b, c in zip(range(21, 27), ["C", "F", "Am", "D7", "F", "G7"])]
PLAN += [(27, "C69", "finale")]

orch = np.zeros(N)
lead = np.zeros(N)
perc = np.zeros(N)

# Fanfare: timpani roll under the countdown, brass C chord on the logo (1.4s)
LOGO = 1.4
add(perc, 0.2, timpani(hz(36), LOGO - 0.2, roll=True), 0.35)
for m in (48, 55, 60, 64, 67):
    add(orch, LOGO, brass(hz(m), 1.4), 0.11)
add(orch, LOGO, glock(hz(84)), 0.14)
add(perc, LOGO, timpani(hz(36), 1.4), 0.3)

for bar, name, sec in PLAN:
    t0 = bar * BAR
    tones = CH[name]
    root = root_of(tones)
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
                add(orch, tb, tuba(hz(root if beat == 0 else root + 7)), 0.15)
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
            add(orch, tb, tuba(hz(root if beat % 2 == 0 else root + 7)), 0.18)
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

# ---------------------------------------------------------------- picture-sync moments

# "The work is endless": a pizzicato ostinato that won't stop speeding up and climbing
ENDLESS, STOP, SOFT = 32.6, 34.55, 35.0
tt = ENDLESS
k = 0
while tt < STOP:
    gap = max(0.045, 0.24 * (1 - (tt - ENDLESS) / (STOP - ENDLESS)) ** 1.6)
    m = 72 + int(k * 0.7) % 24
    add(orch, tt, pizz(hz(m), 0.2), 0.11)
    add(orch, tt, pizz(hz(m - 12), 0.2), 0.06)
    if k % 2 == 0:
        add(perc, tt, snare(0.08), 0.03 + 0.05 * (tt - ENDLESS) / (STOP - ENDLESS))
    tt += gap
    k += 1

# the soft section, on the cut to the night sky: four chords, 1.75s each
for i, name in enumerate(["Fmaj7", "Em7", "Dm7", "G7sus"]):
    t0 = SOFT + i * 1.75
    tones = CH[name]
    root = root_of(tones)
    for m in tones:
        add(orch, t0, strings(hz(C + m), 2.3), 0.08)
    add(orch, t0, tuba(hz(root), 1.6), 0.12)
    add(orch, t0 + 0.9, glock(hz(C + 24 + tones[-1]), 1.5), 0.04)

# 42s, JOIN THE MOVEMENT: a sting — brass stab, timpani, a crash
for m in (48, 55, 60, 64, 67, 72):
    add(orch, 42.0, brass(hz(m), 0.7), 0.1)
add(perc, 42.0, timpani(hz(36), 1.5), 0.45)
add(perc, 42.0, crash(), 0.07)

# 58.5s, the button: one short, satisfied C major, after a breath of silence
BUTTON_AT = 58.5
button = np.zeros(N)
for m in (48, 60, 64, 67, 72):
    add(button, BUTTON_AT, pizz(hz(m), 0.4), 0.11)
add(button, BUTTON_AT, tuba(hz(36), 0.3), 0.3)
add(button, BUTTON_AT, glock(hz(96), 1.0), 0.1)

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
MELODY += [
    (35.2, 81, 1.45),
    (36.75, 83, 1.7),
    # 38.6s — the searchlight finds someone: the theremin swoops up and hangs there
    (38.6, 88, 1.6),
    (40.25, 86, 0.8),
    (41.1, 79, 0.8),
]
# march: proud, plain
phrase(21, [(84, 2), (79, 2)])
phrase(22, [(81, 2), (84, 2)])
phrase(23, [(84, 1), (83, 1), (81, 2)])
phrase(24, [(78, 2), (81, 2)])
phrase(25, [(81, 1), (79, 1), (77, 1), (81, 1)])
phrase(26, [(79, 3), (83, 1)])
# finale: glide up to high C and hang there
phrase(27, [(84, 2), (91, 4.5)])


lead = render_theremin(MELODY, N, fade_at=57.9)

# ---------------------------------------------------------------- master: optical soundtrack

mix = orch + perc + 0.045 * lead  # theremin pulled back: underneath, not on top
tape_stop(mix, STOP, SOFT)  # the conveyor's tape-stop
mix = master(mix, DUR, fade_end=57.95, button=button)  # the finale chord dies away before the fine print

out = Path(__file__).resolve().parent.parent / "public" / "music.wav"
write_wav(out, mix)
print(f"wrote {out}  ({DUR:.0f}s)")
