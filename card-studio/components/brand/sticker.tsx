"use client";

import {
  EMBLEM,
  GLYPH_CENTER,
  RING_TYPE_START_OFFSET,
  STICKER,
  WAVE_PATHS,
  ringTypeArc,
  ringTypeBaseline,
  ringTypeTracking,
  stickerRadii,
} from "@/lib/brand";
import { SEVEN_POINT } from "@/components/star";
import { useId } from "react";

/**
 * THE CIRCLE STICKER — the emblem, cream on purple, cut round.
 *
 * Two flavours, because sticker shops disagree about what they want:
 *
 *   bleed   — a square of artwork with the ground running past the cut, plus
 *             optional guide circles. For printers who ask for bleed and a cut
 *             line of their own.
 *   diecut  — nothing outside the cut circle at all, transparent. For shops
 *             that cut to the artwork silhouette (a custom-shape product).
 *   circle  — ground edge to edge, with the SQUARE's inscribed circle treated
 *             as the cut. For a shop's fixed "circle sticker" product, where
 *             they cut their own circle and a transparent margin would leave a
 *             pale ring outside the artwork.
 *
 * Geometry comes from stickerRadii(), which takes the REAL cut diameter in mm,
 * because the bleed is a fixed physical eighth of an inch — it is a much larger
 * fraction of a 51mm sticker than of a 102mm one, and a single fixed ratio
 * would be wrong at one end or the other.
 */
export function Sticker({
  className,
  style,
  cutMm = 76,
  flavour = "diecut",
  ground,
  ink = STICKER.ink,
  guides = false,
  title = "Vibe Corp",
}: {
  className?: string;
  style?: React.CSSProperties;
  cutMm?: number;
  flavour?: "bleed" | "diecut" | "circle";
  ground?: string;
  ink?: string;
  guides?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fill = ground ?? STICKER.ground;
  const R = stickerRadii(cutMm);
  const C = R.box / 2;
  // In `circle` the image IS the cut, so there is no bleed ring to allow for
  // and the safe radius is measured off the square instead.
  const safeR =
    flavour === "circle" ? (R.box / 2) * ((cutMm - 2 * STICKER.safeMm) / cutMm) : R.safe;
  const cutR = flavour === "circle" ? R.box / 2 : R.cut;
  // The emblem's outer rule lands on the safe circle.
  const k = safeR / EMBLEM.ruleRadius;
  const e = EMBLEM.center;

  const ring = (
    <g transform={`translate(${C} ${C}) scale(${k}) translate(${-e} ${-e})`}>
      <circle cx={e} cy={e} r={EMBLEM.ruleRadius} fill="none" stroke={ink} strokeWidth={EMBLEM.ruleWidth} />
      <circle cx={e} cy={e} r={EMBLEM.innerRule} fill="none" stroke={ink} strokeWidth={EMBLEM.innerRuleWidth} />

      <defs>
        {(["top", "bottom"] as const).map((place) => (
          <path
            key={place}
            id={`${uid}-${place}`}
            d={ringTypeArc(e, e, ringTypeBaseline(EMBLEM.band, EMBLEM.fontSize, place), place)}
            fill="none"
          />
        ))}
      </defs>
      <g
        fill={ink}
        fontWeight={700}
        textAnchor="middle"
        fontSize={EMBLEM.fontSize}
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif"
      >
        {([["top", "VIBE"], ["bottom", "CORP"]] as const).map(([place, word]) => (
          <text
            key={place}
            letterSpacing={ringTypeTracking(EMBLEM.band, EMBLEM.fontSize, place, EMBLEM.tracking)}
          >
            <textPath href={`#${uid}-${place}`} startOffset={RING_TYPE_START_OFFSET}>
              {word}
            </textPath>
          </text>
        ))}
      </g>

      {[-1, 1].map((dir) => (
        <g
          key={dir}
          transform={`translate(${e + dir * EMBLEM.band - EMBLEM.starSize / 2} ${e - EMBLEM.starSize / 2}) scale(${EMBLEM.starSize / 100})`}
        >
          <path d={SEVEN_POINT} fill={ink} />
        </g>
      ))}

      {/* Centred by the artwork's own measured box, never by the canvas centre. */}
      <g
        transform={`translate(${e} ${e}) scale(${EMBLEM.waveWidth / 82.72}) translate(${-GLYPH_CENTER.x} ${-GLYPH_CENTER.y})`}
        fill={ink}
      >
        {WAVE_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${R.box} ${R.box}`}
      className={className}
      style={style}
      role="img"
      aria-label={title}
    >
      {flavour === "diecut" ? (
        <circle cx={C} cy={C} r={cutR} fill={fill} />
      ) : (
        <rect width={R.box} height={R.box} fill={fill} />
      )}
      {ring}
      {guides && (
        <g fill="none" strokeWidth={0.7} strokeDasharray="4 3">
          <circle cx={C} cy={C} r={cutR} stroke="#c4462a" />
          <circle cx={C} cy={C} r={safeR} stroke="#2fa090" />
        </g>
      )}
    </svg>
  );
}
