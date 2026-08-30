"use client";

import { ImageOff } from "lucide-react";
import { Star } from "@/components/star";
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
 * deep cosmic purple into near-black, so the panel has depth and separates from
 * the image above instead of merging with it. The purple is the vibrant end of
 * the palette — it should read as lit, not as a grey wash.
 */
const PLATE_GRADIENT = [
  "radial-gradient(110% 70% at 50% 0%, rgba(232,169,41,0.22) 0%, rgba(232,169,41,0) 62%)",
  "radial-gradient(95% 65% at 50% 0%, rgba(138,60,215,0.46) 0%, rgba(138,60,215,0) 76%)",
  "linear-gradient(180deg, #341a66 0%, #1d0f3d 48%, #0a0514 100%)",
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

        {/* Name plate — dark plum, top left, inside the safe margin */}
        <div
          className="absolute max-w-[66cqw] rounded-[2cqw] border-[0.45cqw] border-deck-mustard bg-deck-plum px-[2.5cqw] py-[1.2cqw]"
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
        <p className="shrink-0 text-center font-card-serif text-[3.8cqw] leading-[1.3] text-deck-mustard">
          {card.fieldReading}
        </p>

        {/* Standing assignments, each marked with the deck's star. */}
        <div className="flex flex-1 flex-col justify-center gap-[1.6cqw]">
          <div className="font-mono text-[2.8cqw] uppercase tracking-[0.42em] text-deck-purple">
            Assignment
          </div>
          {assignments.length > 0 ? (
            <ul className="space-y-[1.4cqw]">
              {assignments.map((entry, i) => (
                <li key={i} className="flex items-baseline gap-[2.2cqw]">
                  {/* Nudged down off the baseline so the star centres on the
                      first line of text rather than sitting on it. */}
                  <Star
                    points={7}
                    className="shrink-0 translate-y-[0.9cqw] text-deck-brick"
                    style={{ width: "4.4cqw", height: "4.4cqw" }}
                  />
                  <span className="text-[3.4cqw] uppercase leading-snug tracking-[0.06em] text-deck-cream">
                    {entry}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[3.4cqw] uppercase tracking-[0.06em] text-deck-teal/60">— no assignment yet —</p>
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
 * The divider ornament: seven stars straddling the rule, every one of them
 * seven-pointed — a big one at centre with three tapering away on each side,
 * the Seven Stars cluster read as a mark. Tarot-plate decoration — it is the
 * one flourish on an otherwise plain plate, so it carries the whole "this is a
 * card, not a label" read.
 */
function Ornament() {
  // Sizes taper outward from the centre star; six flankers + the centre = seven.
  const FLANK = [2.5, 3.4, 4.7];

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[2.8cqw] text-deck-mustard">
      {FLANK.map((size, i) => (
        <OrnamentStar key={`l${i}`} size={size} />
      ))}
      <OrnamentStar size={10.6} />
      {[...FLANK].reverse().map((size, i) => (
        <OrnamentStar key={`r${i}`} size={size} />
      ))}
    </div>
  );
}

/**
 * Every star on the divider carries the same black keyline. The stroke is in
 * viewBox units, so it scales with the star — the small ones read as the same
 * mark as the centre, not as a thicker-outlined variant of it.
 */
function OrnamentStar({ size }: { size: number }) {
  return (
    <Star
      points={7}
      outlined
      className="shrink-0"
      style={{ width: `${size}cqw`, height: `${size}cqw` }}
    />
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
      className="absolute rounded-[2cqw] border-[0.45cqw] border-deck-mustard bg-deck-plum px-[2.2cqw] py-[1.2cqw]"
    >
      <span className="font-mono text-[3.4cqw] font-medium leading-none tracking-[0.1em] text-deck-mustard">
        {code}
      </span>
    </div>
  );
}
