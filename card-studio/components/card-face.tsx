"use client";

import { ImageOff } from "lucide-react";
import type { Card } from "@/lib/types";
import { imageUrl } from "@/lib/client";
import { cn } from "@/lib/utils";
import { ART_HEIGHT_FRACTION, SAFE_MARGIN } from "@/lib/card-format";

/**
 * The composited card face: full-bleed art across the top, with the name plate
 * and code bubble floating over it, and a text plate below.
 *
 * ART SLOT — the art band is exactly as tall as the card is wide, so it is a
 * square and matches the 1:1 aspect ratio requested from the image model. Both
 * numbers come from lib/card-format.ts; if they ever disagree the art gets
 * cropped and the framing drifts.
 *
 * PRINT MARGIN — the rule for this deck: art may bleed to the trim edge, but no
 * readable content ever may. Every text element, plate and mark sits inside a
 * 5% safe margin on all four edges, so a trim that drifts eats only artwork.
 *
 * Everything is sized in `cqw` (percent of card width) against a container
 * query on the root, so the face is resolution-independent: the grid preview
 * and a 63x88mm print are the same design, not two different ones.
 */
/**
 * The plate is not flat black: a warm spill from the art fades down through a
 * deep cosmic blue into black, so the panel has depth and separates from the
 * image above instead of merging with it.
 */
const PLATE_GRADIENT = [
  "radial-gradient(110% 70% at 50% 0%, rgba(232,169,41,0.16) 0%, rgba(232,169,41,0) 62%)",
  "radial-gradient(90% 60% at 50% 0%, rgba(51,88,196,0.22) 0%, rgba(51,88,196,0) 70%)",
  "linear-gradient(180deg, #171a3a 0%, #0b0b18 52%, #000000 100%)",
].join(", ");

export function CardFace({ card, className }: { card: Card; className?: string }) {
  const src = imageUrl(card);
  const assignments = card.assignments ?? [];

  return (
    <div
      className={cn(
        "relative flex aspect-[63/88] w-full flex-col overflow-hidden rounded-xl border border-deck-mustard/30 bg-deck-black text-deck-cream shadow-lg [container-type:inline-size]",
        className,
      )}
    >
      {/* Art — full bleed, square band across the top */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ height: `${ART_HEIGHT_FRACTION * 100}%` }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={card.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[2cqw] bg-deck-ink text-deck-teal">
            <ImageOff className="h-[10cqw] w-[10cqw]" />
            <span className="text-[3cqw] uppercase tracking-widest">{card.object}</span>
          </div>
        )}

        {/* Name plate — flat black, top left, inside the safe margin */}
        <div
          className="absolute max-w-[66cqw] rounded-[2cqw] border-[0.45cqw] border-deck-mustard bg-deck-black px-[2.5cqw] py-[1.2cqw]"
          style={{ left: SAFE_MARGIN, top: SAFE_MARGIN }}
        >
          {/* The name is never clipped — long names step down a size rather
              than truncate, and wrap before they reach the code bubble. */}
          <div
            className="font-semibold uppercase leading-tight tracking-[0.16em] text-deck-cream"
            style={{ fontSize: `${nameSize(card.name)}cqw` }}
          >
            {card.name}
          </div>
          <div className="truncate text-[2.6cqw] uppercase leading-tight tracking-[0.2em] text-deck-mustard">
            {card.designation}
          </div>
        </div>

        {/* Code bubble — top right, matching the name plate */}
        <CodeBubble code={card.code} style={{ right: SAFE_MARGIN, top: SAFE_MARGIN }} />
      </div>

      {/* Text plate — a hairline rule matching the name plate border, then a
          cosmic gradient rather than flat black, so the panel reads as its own
          field against the art above. */}
      <div
        className="relative flex flex-1 flex-col border-t-[0.45cqw] border-deck-mustard"
        style={{
          paddingLeft: SAFE_MARGIN,
          paddingRight: SAFE_MARGIN,
          paddingBottom: SAFE_MARGIN,
          // The plate's top edge is the internal divider, not a card edge, so
          // the print safe margin does not apply here.
          paddingTop: "5.5cqw",
          backgroundImage: PLATE_GRADIENT,
        }}
      >
        <Ornament />

        {/* Field reading — the reading issued with the draw. */}
        <p className="shrink-0 text-center font-card-serif text-[4cqw] leading-[1.3] text-deck-mustard">
          {card.fieldReading}
        </p>

        {/* Standing assignments, numbered so they read as issued. */}
        <div className="flex flex-1 flex-col justify-center gap-[1.6cqw]">
          <div className="font-mono text-[2.2cqw] uppercase tracking-[0.28em] text-deck-teal">
            Assignment
          </div>
          {assignments.length > 0 ? (
            <ul className="space-y-[1.4cqw]">
              {assignments.map((entry, i) => (
                <li key={i} className="flex items-baseline gap-[2.2cqw]">
                  <span className="font-mono text-[2.8cqw] leading-none text-deck-brick">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[3.5cqw] leading-snug text-deck-cream">
                    {entry}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[3.5cqw] italic text-deck-teal/60">— no assignment yet —</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Long names step down in size so the plate stays on one or two lines and
 * never runs under the code bubble. Tuned against the longest names in the
 * deck ("The Keeper of Base").
 */
function nameSize(name: string) {
  if (name.length > 16) return 3.5;
  if (name.length > 12) return 4.0;
  return 4.4;
}

/**
 * The divider ornament: seven stars straddling the rule — one bright star at
 * centre with three smaller ones tapering away on each side, the Seven Stars
 * cluster read as a mark. Tarot-plate decoration — it is the one flourish on
 * an otherwise plain plate, so it carries the whole "this is a card, not a
 * label" read.
 */
function Ornament() {
  // Sizes taper outward from the centre star; six flankers + the centre = seven.
  const FLANK = [1.5, 2.1, 2.9];

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[1.5cqw]">
      {FLANK.map((size, i) => (
        <Star key={`l${i}`} size={size} />
      ))}
      <Star size={6.2} outlined />
      {[...FLANK].reverse().map((size, i) => (
        <Star key={`r${i}`} size={size} />
      ))}
    </div>
  );
}

/** Four concave arms — a spark of light rather than a compass rose. */
const SPARK =
  "M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2 Z";

/** Seven points, one per star of the cluster — the mark at the centre. */
const SEVEN_POINT =
  "M50.0 6.0 L58.2 32.9 L84.4 22.6 L68.5 45.8 L92.9 59.8 L64.9 61.8 L69.1 89.6 L50.0 69.0 L30.9 89.6 L35.1 61.8 L7.1 59.8 L31.5 45.8 L15.6 22.6 L41.8 32.9 Z";

/**
 * A star on the divider. `outlined` gives the centre star the black keyline it
 * needs to hold against the mustard rule behind it, and switches it to the
 * seven-pointed form.
 */
function Star({ size, outlined = false }: { size: number; outlined?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="shrink-0 text-deck-mustard"
      style={{ width: `${size}cqw`, height: `${size}cqw` }}
      aria-hidden
    >
      <path
        d={outlined ? SEVEN_POINT : SPARK}
        fill="currentColor"
        stroke={outlined ? "#000000" : "none"}
        strokeWidth={outlined ? 7 : 0}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
    </svg>
  );
}

/**
 * The card's classification code, set in mono so it reads as issued rather
 * than designed. Same plate treatment as the name, top right.
 */
function CodeBubble({ code, style }: { code: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className="absolute rounded-[2cqw] border-[0.45cqw] border-deck-mustard bg-deck-black px-[2.2cqw] py-[1.2cqw]"
    >
      <span className="font-mono text-[3.4cqw] font-medium leading-none tracking-[0.1em] text-deck-mustard">
        {code}
      </span>
    </div>
  );
}
