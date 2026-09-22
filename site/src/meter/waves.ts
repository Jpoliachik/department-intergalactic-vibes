// The meter's toolkit: small functions of the moment that compose. A Wave
// takes the current Moment and returns a number; build the meter's life by
// adding, scaling and nesting them. See patch.ts for them in use.

export type Moment = {
  /** seconds since the page opened */
  t: number;
  /** seconds since the last frame */
  dt: number;
  /** local hour, fractional (19.5 is half seven in the evening) */
  hour: number;
  /** recent presence, 0–1, already decaying: typing, picks, taps */
  presence: number;
  /** the post on file, if a card was entered */
  post?: string;
  /** seconds until the next scheduled episode (Infinity while one runs) */
  untilEpisode: number;
};

export type Wave = (m: Moment) => number;

const TAU = Math.PI * 2;

/** Always `v`. */
export const constant =
  (v: number): Wave =>
  () =>
    v;

/** A sine around zero: ±amp, one cycle every `period` seconds. */
export const sine =
  (period: number, amp = 1, phase = 0): Wave =>
  (m) =>
    amp * Math.sin(TAU * (m.t / period + phase));

/** 0 → 1 → 0 once every `period` seconds, eased at both ends, like breathing. */
export const breath =
  (period: number): Wave =>
  (m) =>
    (1 - Math.cos((TAU * m.t) / period)) / 2;

/** Fresh random noise every sample, ±amp. Crackle, not drift. */
export const jitter =
  (amp: number): Wave =>
  () =>
    (Math.random() - 0.5) * 2 * amp;

/** Smooth wandering noise, ±amp. `speed` is roughly how many turns per second. Organic drift. */
export function noise(speed: number, amp = 1): Wave {
  const points = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
  return (m) => {
    const x = m.t * speed;
    const i = Math.floor(x);
    const f = (1 - Math.cos(Math.PI * (x - i))) / 2;
    const a = points[i & 255];
    const b = points[(i + 1) & 255];
    return amp * (a + (b - a) * f);
  };
}

/**
 * A cycle whose speed can change without jumping: it keeps its own phase,
 * advanced by `rate` (cycles per second) each frame. `shape` maps phase 0–1
 * to the output; the default breathes 0 → 1 → 0.
 * Stateful: evaluate it exactly once per frame.
 */
export function oscillator(rate: Wave, shape: (phase: number) => number = (p) => (1 - Math.cos(TAU * p)) / 2): Wave {
  let phase = 0;
  return (m) => {
    phase = (phase + m.dt * rate(m)) % 1;
    return shape(phase);
  };
}

/** Add waves together. */
export const sum =
  (...waves: Wave[]): Wave =>
  (m) =>
    waves.reduce((v, w) => v + w(m), 0);

/** Multiply a wave by a number, or by another wave. */
export const scale =
  (w: Wave, by: number | Wave): Wave =>
  (m) =>
    w(m) * (typeof by === "number" ? by : by(m));

/** Map 0–1 onto lo–hi. */
export const between =
  (w: Wave, lo: number, hi: number): Wave =>
  (m) =>
    lo + (hi - lo) * w(m);

/** Ease from `from` toward `to` with a time constant of `seconds` (1 − e^(−t/τ)). */
export const settle =
  (seconds: number, from = 0, to = 1): Wave =>
  (m) =>
    from + (to - from) * (1 - Math.exp(-m.t / seconds));
