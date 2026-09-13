"use client";

import {
  DISC_PATH,
  GLYPH_VIEWBOX,
  GRADIENT_STOPS,
  MARK_CENTER,
  MARK_VIEWBOX,
  PALETTE,
  RING_PATH,
  RING_STROKE_WIDTH,
  WAVE_PATHS,
} from "@/lib/brand";
import { useId } from "react";

/**
 * The mark, in three nested pieces.
 *
 *   Glyph  — the waves alone. The atomic form. Survives at favicon size, in a
 *            single colour, embroidered, embossed, or punched out of vinyl.
 *   Badge  — disc + ring + waves. The primary mark.
 *   Seal   — badge + circular type, with a SWAPPABLE bottom ring. This is the
 *            one that generates artifacts: change two strings and the same
 *            seal issues a field assignment, certifies a vibe, or records a
 *            commendation.
 *
 * Colour is never baked in. The waves and ring take `currentColor`, so a mark
 * is coloured by the thing it sits in. `treatment` opts into the gradient,
 * which is a treatment and not the mark — see lib/brand.ts.
 */

export type MarkTreatment = "flat" | "gradient";

function WaveFill({ id, treatment }: { id: string; treatment: MarkTreatment }) {
  if (treatment !== "gradient") return null;
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        {GRADIENT_STOPS.map((s) => (
          <stop key={s.offset} offset={s.offset} stopColor={s.color} />
        ))}
      </linearGradient>
    </defs>
  );
}

/** The waves alone, no disc. Inherits colour from its parent. */
export function Glyph({
  className,
  style,
  treatment = "flat",
  title,
}: {
  className?: string;
  style?: React.CSSProperties;
  treatment?: MarkTreatment;
  title?: string;
}) {
  const uid = useId();
  const grad = `vc-glyph-${uid}`;
  return (
    <svg
      viewBox={GLYPH_VIEWBOX}
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      <WaveFill id={grad} treatment={treatment} />
      <g fill={treatment === "gradient" ? `url(#${grad})` : "currentColor"}>
        {WAVE_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Disc + ring + waves.
 *
 * `disc` is the ground the mark is struck into; pass null to knock the disc
 * out entirely (for a mark placed directly on artwork). `ring` defaults on —
 * turn it off below roughly 24px, where the hairline fills in and turns the
 * mark to mud.
 */
export function Badge({
  className,
  style,
  treatment = "flat",
  disc = PALETTE.ink.hex,
  ring = true,
  title = "Vibe Corp",
}: {
  className?: string;
  style?: React.CSSProperties;
  treatment?: MarkTreatment;
  disc?: string | null;
  ring?: boolean;
  title?: string;
}) {
  const uid = useId();
  const grad = `vc-badge-${uid}`;
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} style={style} role="img" aria-label={title}>
      <WaveFill id={grad} treatment={treatment} />
      {disc && <path d={DISC_PATH} fill={disc} />}
      {ring && (
        <path
          d={RING_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_STROKE_WIDTH}
          strokeMiterlimit={10}
        />
      )}
      <g fill={treatment === "gradient" ? `url(#${grad})` : "currentColor"}>
        {WAVE_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The seal — the badge wearing circular type.
 *
 * The top ring is the outfit's name and effectively never changes. The bottom
 * ring is the whole point: it says what this particular object IS. One
 * component, every future artifact.
 *
 * The type is set on true circles concentric with MARK_CENTER — the mark
 * itself is hand-drawn and slightly irregular, but letterforms marching around
 * a wobbling path read as a mistake rather than as age, so the type ring is
 * perfect even though the disc under it is not.
 */
export function Seal({
  className,
  style,
  top = "Vibe Corp",
  bottom = "Field Assignment",
  treatment = "flat",
  /** Radius of the type baseline, in mark units (the disc's outer edge is ~68).
   *  One radius, shared by both lines, so the seal reads as a single struck
   *  ring of type rather than two rings that nearly agree. */
  typeRadius = 57,
  topSize = 15,
  /** Leave unset — the bottom line is auto-fitted to the arc. See below. */
  bottomSize,
  /** How far the ring-and-waves core shrinks to open a type zone around it.
   *  At 1 the core fills the disc and there is nowhere for type to go. */
  coreScale = 0.68,
  /** The core rides a touch high: the bottom line is the longer of the two, so
   *  the optical centre of the type ring sits above the geometric one. */
  coreOffsetY = -3,
  title,
}: {
  className?: string;
  style?: React.CSSProperties;
  top?: string;
  bottom?: string;
  treatment?: MarkTreatment;
  typeRadius?: number;
  topSize?: number;
  bottomSize?: number;
  coreScale?: number;
  coreOffsetY?: number;
  title?: string;
}) {
  const uid = useId();
  const grad = `vc-seal-${uid}`;
  const topArc = `vc-seal-top-${uid}`;
  const botArc = `vc-seal-bot-${uid}`;
  const { x: cx, y: cy } = MARK_CENTER;
  // Two half-circles. The top one runs left→right over the top (sweep 1), so
  // its letters stand with their heads pointing out. The bottom runs
  // left→right under the bottom (sweep 0), so its letters point back in
  // toward the waves. Both read normally, clockwise, as a struck seal does.
  const r = typeRadius;
  const topPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const botPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;

  // The bottom line is auto-fitted, because the whole value of this component
  // is that the label is a prop — and a prop that silently overruns the arc is
  // not a prop, it is a trap. Every label is sized to occupy the same share of
  // the bottom arc, so "Commendation" and "Provisional Induction" sit with
  // the same air at the shoulders. Clamped at both ends: a two-word label must
  // not balloon past the top line, and a long one has to stay legible rather
  // than shrinking forever. A label that needs the floor size is too long —
  // shorten the words, not the type.
  const ARC_SHARE = 0.72;
  const fitted = (ARC_SHARE * Math.PI * r) / Math.max(bottom.length, 1) / 0.8;
  const botSize = bottomSize ?? Math.max(6.8, Math.min(10.5, fitted));

  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      style={style}
      role="img"
      aria-label={title ?? [top, bottom].filter(Boolean).join(" — ")}
    >
      <WaveFill id={grad} treatment={treatment} />
      <defs>
        <path id={topArc} d={topPath} fill="none" />
        <path id={botArc} d={botPath} fill="none" />
      </defs>

      <path d={DISC_PATH} fill={PALETTE.ink.hex} />

      {/* The core — ring + waves — shrunk inside the disc so the type ring has
          somewhere to live. The stroke is divided by the same scale, so the
          hairline keeps the weight it has on the bare badge instead of
          thinning out as the core comes down. */}
      <g
        transform={`translate(${cx} ${cy + coreOffsetY}) scale(${coreScale}) translate(${-cx} ${-cy})`}
      >
        <path
          d={RING_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_STROKE_WIDTH / coreScale}
          strokeMiterlimit={10}
        />
        <g fill={treatment === "gradient" ? `url(#${grad})` : "currentColor"}>
          {WAVE_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>

      {/* Ring type — always the signal colour. The seal's type is the part you
          are meant to read, and mustard is what "read this" looks like. */}
      <g fill={PALETTE.mustard.hex} fontWeight={700} textAnchor="middle">
        {top && (
          <text fontSize={topSize} letterSpacing={topSize * 0.16}>
            <textPath href={`#${topArc}`} startOffset="50%">
              {top.toUpperCase()}
            </textPath>
          </text>
        )}
        {bottom && (
          <text fontSize={botSize} letterSpacing={botSize * 0.18}>
            <textPath href={`#${botArc}`} startOffset="50%">
              {bottom.toUpperCase()}
            </textPath>
          </text>
        )}
      </g>
    </svg>
  );
}
