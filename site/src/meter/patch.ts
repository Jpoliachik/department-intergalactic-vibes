// The meter's design: every creative decision about how the reading lives.
// Change numbers, swap waves, add a post's temperament or a new episode;
// meter.ts plays whatever is here and shouldn't need touching.
//
// Channels, each a Wave:
//   hz      the number, in Hz
//   glow    the dot's brightness, 0–1
//   size    the dot's scale, around 1
//   dot     the dot's colour, a brand band (mustard unless a post says otherwise)
// Episodes override any of these for a few seconds, drawn from progress k (0→1).

import tokens from "../brand/tokens.json";
import { constant, jitter, noise, oscillator, scale, settle, sine, sum, type Moment, type Wave } from "./waves";

export type Band = "mustard" | "teal" | "blue" | "purple" | "rose" | "brick";
/** What the meter shows at one instant. `hz: null` is no signal. */
export type Reading = { hz: number | null; glow: number; size: number; dot: Band | "alarm" | "cream"; mood?: "hot" | "lost" | "bright" };

export const COLORS: Record<Reading["dot"], string> = {
  ...(Object.fromEntries(Object.entries(tokens.palette).map(([k, v]) => [k, v.hex])) as Record<Band, string>),
  alarm: "#ec5b3f",
  cream: tokens.palette.cream.hex,
};

const EARTH = 7.83; // the Schumann resonance: where every reading starts

/* ---------- each post rests in its own way (card holders only) ---------- */

type Temperament = {
  /** added to the resting hz */
  hz?: Wave;
  /** breaths per second for the dot (default ~0.42, one every 2.4s) */
  beat?: number;
  dot?: Band;
};

export const TEMPERAMENTS: Record<string, Temperament> = {
  "the-rookie": { hz: jitter(0.05), beat: 0.5, dot: "teal" }, // bright-eyed
  "the-anchor": { hz: jitter(0.004), beat: 0.3, dot: "blue" }, // barely moves, breathes slow
  "the-spark": { hz: sum(jitter(0.08), noise(0.8, 0.04)), beat: 0.7, dot: "brick" }, // jumpy
  "the-connector": { hz: sine(16, 0.03), dot: "rose" },
  "the-beacon": { hz: sum(constant(0.05), jitter(0.008)), beat: 0.35 }, // steady and a little bright; keeps the mustard
  "the-tuner": { hz: noise(0.05, 0.03), beat: 0.33, dot: "teal" },
  "the-caretaker": { hz: sum(constant(0.02), jitter(0.02)), dot: "rose" },
  "the-wanderer": { hz: noise(0.04, 0.12), dot: "purple" }, // wanders off and comes back
  "the-jester": { hz: sum(jitter(0.06), sine(7, 0.03)), beat: 0.6, dot: "rose" },
  "the-pulse": { hz: sine(4, 0.05), beat: 0.5, dot: "brick" }, // keeps a beat
  "the-oracle": { hz: jitter(0.02), dot: "purple" }, // and see the hunch below
  "the-fire-tender": { hz: sum(constant(0.03), noise(0.3, 0.02)), beat: 0.35, dot: "brick" }, // warm, flickering
  "the-patchwork": { hz: jitter(0.03), dot: "teal" },
  "the-deep-diver": { hz: sum(constant(-0.23), noise(0.03, 0.05)), beat: 0.25, dot: "blue" }, // runs low and slow
  "the-enchanter": { hz: sine(9, 0.03), dot: "purple" },
  "the-mentor": { hz: jitter(0.02), beat: 0.38, dot: "blue" },
};

const temperament = (m: Moment): Temperament => (m.post && TEMPERAMENTS[m.post]) || {};

/* ---------- at rest ---------- */

const defaultJitter = jitter(0.03);

/** The number: Earth's resonance, plus everything that nudges it. */
const hz: Wave = sum(
  constant(EARTH),
  (m) => (temperament(m).hz ?? defaultJitter)(m), // never quite still, in the post's own way
  (m) => 0.05 * Math.cos((Math.PI * 2 * (m.hour - 19.5)) / 24), // strongest at dusk, weakest before dawn
  scale(settle(420), 0.3), // stay a while and it strengthens, toward +0.25 after ten minutes
  (m) => 0.07 * m.presence, // someone's here
  (m) => (m.post === "the-oracle" && m.untilEpisode < 5 ? 0.45 * (1 - m.untilEpisode / 5) ** 2 : 0), // the Oracle knew
);

/** The dot breathes, faster when someone's here. Its speed glides, never jumps. */
const breathing = oscillator((m) => (temperament(m).beat ?? 1 / 2.4) * (1 + 1.2 * m.presence));
/** A slow shimmer in the dot's size, under the breath. */
const shimmer = noise(0.2, 0.03);

export function resting(m: Moment): Reading {
  const b = breathing(m); // an oscillator: evaluate exactly once per frame
  return {
    hz: hz(m),
    glow: 0.22 + 0.78 * b,
    size: 0.92 + 0.1 * b + shimmer(m),
    dot: temperament(m).dot ?? "mustard",
  };
}

/** How often the number redraws, in ms. The dot animates every frame regardless. */
export const cadence = (m: Moment, episode: boolean) => (episode ? 90 : m.presence > 0.06 ? 300 : 1400);

/* ---------- episodes: anomalies, one at a time ---------- */

export type Episode = { seconds: number; draw: (k: number, rest: Reading, m: Moment) => Partial<Reading> };

export const EPISODES = {
  /** The surge: climbs, runs hot and red, and settles back. The dot races. */
  spike(): Episode {
    const peak = 30 + Math.random() * 60;
    const [up, hold, down] = [2.6, 0.9, 3.4];
    const flicker = oscillator(() => 2.6);
    return {
      seconds: up + hold + down,
      draw(k, rest, m) {
        const t = k * (up + hold + down);
        const h = t < up ? (t / up) ** 2 : t < up + hold ? 1 : 1 - (t - up - hold) / down;
        const hot = h > 0.12;
        const f = flicker(m);
        return {
          hz: (rest.hz ?? EARTH) + (peak - EARTH) * h + (Math.random() - 0.5) * 3 * h,
          glow: hot ? 0.35 + 0.65 * f : rest.glow,
          size: rest.size + 0.25 * h * f,
          dot: hot ? "alarm" : rest.dot,
          mood: hot ? "hot" : undefined,
        };
      },
    };
  },
  /** Signal lost: flickers out, holds dark, flickers back. */
  dropout(): Episode {
    return {
      seconds: 2.2,
      draw(k, rest) {
        const edge = k < 0.18 || k > 0.8;
        const out = !edge || Math.random() < 0.55;
        return out ? { hz: null, glow: 0.06, size: 0.8, mood: "lost" } : { hz: (rest.hz ?? EARTH) * (0.6 + Math.random() * 0.3), glow: 0.5 };
      },
    };
  },
  /** A tap on the meter: a small bright swell, like a needle being checked. */
  calibrate(): Episode {
    const lift = 1.5 + Math.random() * 2;
    return {
      seconds: 1.3,
      draw: (k, rest) => {
        const s = Math.sin(Math.PI * k);
        return { hz: (rest.hz ?? EARTH) + lift * s, glow: Math.max(rest.glow, s), size: rest.size + 0.35 * s, dot: "cream", mood: "bright" };
      },
    };
  },
};
export type EpisodeName = keyof typeof EPISODES;

/** When anomalies come, and which. The first is always a surge, and early. */
export const SCHEDULE = {
  first: [20, 40] as const,
  gap: [45, 120] as const,
  pick: (n: number): EpisodeName => (n === 0 || Math.random() < 0.75 ? "spike" : "dropout"),
};

/** How much each kind of presence adds (0–1 scale, decays by half every 2.5s). */
export const PRESENCE = { type: 0.02, pick: 0.3, tap: 0.6, halfLife: 2.5 };
