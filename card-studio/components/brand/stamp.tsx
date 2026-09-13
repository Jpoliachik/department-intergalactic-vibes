"use client";

import {
  CAP_RATIO,
  GLYPH_CENTER,
  PALETTE,
  RING_TYPE_START_OFFSET,
  STAMP,
  STAMP_PLAIN,
  WAVE_PATHS,
  ringTypeArc,
  ringTypeBaseline,
  ringTypeTracking,
} from "@/lib/brand";
import { SEVEN_POINT } from "@/components/star";
import { useId } from "react";

/**
 * THE STAMP — ink on paper.
 *
 * A struck roundel: heavy outer rule, a ring of beads, a light inner rule, two
 * words around a single type band with a seven-pointed star closing each
 * shoulder, and the waves in the middle.
 *
 * It is the one mark in the system that does NOT live on the dark ground. It
 * is a thing crew stamp onto something — a card, a sleeve, the back of a hand
 * — so it is ink, and it needs a light surface under it. On dark, reach for
 * the Badge or the Seal instead.
 *
 * All the placement maths lives in lib/brand.ts, where the two traps in
 * setting type around a circle are written down. Read those before touching
 * any radius here.
 */

export function Stamp({
  className,
  style,
  top = "Vibes",
  bottom = "Certified",
  /** The bead ring. Off switches to STAMP_PLAIN's proportions, not just to the
   *  same stamp minus beads — the rules and the centre move too. */
  beaded = true,
  ink = "#12100e",
  /** Draws the type band and the waves' extent. For checking balance, not for
   *  anything that ships. */
  guides = false,
  title,
}: {
  className?: string;
  style?: React.CSSProperties;
  top?: string;
  bottom?: string;
  beaded?: boolean;
  ink?: string;
  guides?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const S = beaded ? STAMP : STAMP_PLAIN;
  const c = S.center;

  // The waves, centred by their MEASURED box. Centring them on the canvas
  // centre instead is the single easiest way to make this look wrong.
  const waveScale = S.waveWidth / 82.72;

  return (
    <svg
      viewBox={S.viewBox}
      className={className}
      style={style}
      role="img"
      aria-label={title ?? [top, bottom].filter(Boolean).join(" ")}
    >
      <circle cx={c} cy={c} r={S.ruleRadius} fill="none" stroke={ink} strokeWidth={S.ruleWidth} />

      {beaded &&
        Array.from({ length: S.beadCount }, (_, k) => {
          const t = ((90 - (k * 360) / S.beadCount) * Math.PI) / 180;
          return (
            <circle
              key={k}
              cx={c + S.beadRadius * Math.cos(t)}
              cy={c - S.beadRadius * Math.sin(t)}
              r={S.beadSize}
              fill={ink}
            />
          );
        })}

      <circle cx={c} cy={c} r={S.innerRule} fill="none" stroke={ink} strokeWidth={S.innerRuleWidth} />

      <defs>
        {(["top", "bottom"] as const).map((place) => (
          <path
            key={place}
            id={`${uid}-${place}`}
            d={ringTypeArc(c, c, ringTypeBaseline(S.band, S.fontSize, place), place)}
            fill="none"
          />
        ))}
      </defs>
      {/* Tracking is per line, not shared: the two baselines sit on different
          radii, so one letter-spacing value gives them two different optical
          rhythms. ringTypeTracking divides that back out. */}
      <g
        fill={ink}
        fontWeight={700}
        textAnchor="middle"
        fontSize={S.fontSize}
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif"
      >
        {([
          ["top", top],
          ["bottom", bottom],
        ] as const).map(([place, word]) =>
          word ? (
            <text key={place} letterSpacing={ringTypeTracking(S.band, S.fontSize, place, S.tracking)}>
              <textPath href={`#${uid}-${place}`} startOffset={RING_TYPE_START_OFFSET}>
                {word.toUpperCase()}
              </textPath>
            </text>
          ) : null,
        )}
      </g>

      {/* Shoulders — the stars close the gap between the two words, so the ring
          reads as one continuous band rather than two separate labels. */}
      {[-1, 1].map((dir) => (
        <g
          key={dir}
          transform={`translate(${c + dir * S.band - S.starSize / 2} ${c - S.starSize / 2}) scale(${S.starSize / 100})`}
        >
          <path d={SEVEN_POINT} fill={ink} />
        </g>
      ))}

      <g
        transform={`translate(${c} ${c}) scale(${waveScale}) translate(${-GLYPH_CENTER.x} ${-GLYPH_CENTER.y})`}
        fill={ink}
      >
        {WAVE_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {guides && (
        <g fill="none" strokeWidth={0.5} strokeDasharray="2 2">
          <circle cx={c} cy={c} r={S.band + (S.fontSize * CAP_RATIO) / 2} stroke={PALETTE.brick.hex} />
          <circle cx={c} cy={c} r={S.band - (S.fontSize * CAP_RATIO) / 2} stroke={PALETTE.brick.hex} />
          <circle cx={c} cy={c} r={(S.waveWidth * (78.3 / 82.72)) / 2} stroke={PALETTE.teal.hex} />
        </g>
      )}
    </svg>
  );
}
