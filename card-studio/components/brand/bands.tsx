"use client";

import { BAND_KEYS, PALETTE } from "@/lib/brand";
import { SEVEN_POINT } from "@/components/star";

/**
 * THE BAND FIELD — Vibe Corp's ground texture.
 *
 * The flowing colour bands with stars caught in them, already the most
 * recognisable surface in the system (it is the back of every card). Made
 * reusable here so a sticker, a page header and a poster can all be the same
 * outfit without commissioning new art each time.
 *
 * Deterministic: the same `seed` always draws the same field. That matters —
 * once a sticker is printed, the field on it needs to be reproducible.
 */

/** Small deterministic PRNG (mulberry32). Same seed, same field, forever. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One band: a wavy strip spanning the full width, drawn as a closed path.
 *  The two edges use different phases, so the band breathes rather than
 *  keeping a constant thickness. */
function bandPath(w: number, yTop: number, thickness: number, amp: number, phase: number, wavelength: number) {
  const step = w / 24;
  const edge = (y: number, ph: number) => {
    const pts: string[] = [];
    for (let x = -step; x <= w + step; x += step) {
      pts.push(`${x.toFixed(1)} ${(y + Math.sin((x / wavelength) * Math.PI * 2 + ph) * amp).toFixed(1)}`);
    }
    return pts;
  };
  const top = edge(yTop, phase);
  const bot = edge(yTop + thickness, phase + 0.9).reverse();
  return `M ${top.join(" L ")} L ${bot.join(" L ")} Z`;
}

export function BandField({
  width = 400,
  height = 560,
  seed = 7,
  /** How many colour bands cross the field. Seven, obviously. Fewer and
   *  thicker reads as the card back; more and thinner reads as a deck chair. */
  bands = 7,
  /** Dust — the small white stars. */
  dust = 34,
  /** Seven-pointed stars caught in the bands. The same geometry the cards use. */
  stars = 5,
  /** Keeps stars out of a circle in the middle, as a fraction of the short
   *  side. Raise it when something sits on top of the field. */
  clearCenter = 0,
  ground = PALETTE.plum.hex,
  className,
  children,
}: {
  width?: number;
  height?: number;
  seed?: number;
  bands?: number;
  dust?: number;
  stars?: number;
  clearCenter?: number;
  ground?: string;
  className?: string;
  /** Anything to sit on top of the field — a seal, usually. */
  children?: React.ReactNode;
}) {
  const r = rng(seed);
  const rows: { d: string; fill: string }[] = [];
  // Bands march down the field with a wandering gap between them, so the
  // ground shows through in uneven stripes rather than a regular corduroy.
  // Bands march down the field with a wandering gap between them. The gap is
  // generous — the plum ground showing through in uneven stripes is as much of
  // the look as the colour is.
  const span = height * 1.16 / bands;
  let y = -height * 0.1;
  for (let i = 0; i < bands; i++) {
    const thickness = span * (0.42 + r() * 0.3);
    rows.push({
      d: bandPath(width, y, thickness, height * (0.015 + r() * 0.045), r() * Math.PI * 2, width * (1.1 + r() * 1.1)),
      fill: PALETTE[BAND_KEYS[i % BAND_KEYS.length]].hex,
    });
    y += span * (0.86 + r() * 0.3);
  }

  const dots = Array.from({ length: dust }, () => ({
    cx: r() * width,
    cy: r() * height,
    rad: 1 + r() * 2.6,
    o: 0.5 + r() * 0.5,
  }));

  // The stars sit on top of everything, keylined in black so they hold
  // whatever band they happen to land on — the same rule the cards use.
  //
  // Placed by rejection sampling rather than pure random: unseeded, stars clump
  // into constellations of three, which reads as a mistake. Each one has to
  // land clear of its neighbours, and clear of the middle of the field, where
  // a seal usually goes. If a seed cannot place them all, it places fewer —
  // a sparse field is fine, a collision is not.
  const marks: { x: number; y: number; size: number }[] = [];
  const minGap = Math.min(width, height) * 0.2;
  const clearR = clearCenter * Math.min(width, height) * 0.5;
  for (let tries = 0; tries < stars * 40 && marks.length < stars; tries++) {
    const size = Math.min(width, height) * (0.09 + r() * 0.07);
    const x = r() * (width - size);
    const y = r() * (height - size);
    const mx = x + size / 2;
    const my = y + size / 2;
    if (Math.hypot(mx - width / 2, my - height / 2) < clearR + size / 2) continue;
    if (marks.some((m) => Math.hypot(mx - (m.x + m.size / 2), my - (m.y + m.size / 2)) < minGap)) continue;
    marks.push({ x, y, size });
  }

  return (
    <div className={className} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" aria-hidden>
        <rect width={width} height={height} fill={ground} />
        {rows.map((b, k) => (
          <path key={k} d={b.d} fill={b.fill} />
        ))}
        {dots.map((d, k) => (
          <circle key={k} cx={d.cx} cy={d.cy} r={d.rad} fill={PALETTE.cream.hex} opacity={d.o} />
        ))}
        {marks.map((m, k) => (
          <g key={k} transform={`translate(${m.x} ${m.y}) scale(${m.size / 100})`}>
            <path
              d={SEVEN_POINT}
              fill={PALETTE.mustard.hex}
              stroke={PALETTE.black.hex}
              strokeWidth={7}
              strokeLinejoin="round"
              paintOrder="stroke"
            />
          </g>
        ))}
      </svg>
      {children && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
      )}
    </div>
  );
}
