"use client";

import { ImageOff } from "lucide-react";
import { Star } from "@/components/star";
import type { Card } from "@/lib/types";
import { imageUrl } from "@/lib/client";
import { cn } from "@/lib/utils";
import {
  ART_HEIGHT_FRACTION,
  PLATE_PAD_BOTTOM,
  PLATE_PAD_TOP,
  SAFE_MARGIN,
  TITLE_INSET_TOP,
  imageOffsetOf,
  imageScaleOf,
} from "@/lib/card-format";

/**
 * The composited card face: full-bleed art across the top, with the name plate
 * and code bubble floating over it, and a text plate below.
 *
 * ART SLOT — the art is generated square but shown in a band slightly shorter
 * than a square, so the text plate has room. object-cover trims the difference
 * evenly top and bottom; each card's own imageScale / imageOffsetY decides what
 * survives the trim. Both numbers come from lib/card-format.ts.
 *
 * PRINT MARGIN — the rule for this deck: art may bleed to the trim edge, but no
 * readable content ever may. Every text element, plate and mark sits inside a
 * 5% safe margin on all four edges, so a trim that drifts eats only artwork.
 *
 * Everything is sized in `cqw` (percent of card width) against a container
 * query on the root, so the face is resolution-independent: the grid preview
 * and a 63x88mm print are the same design, not two different ones.
 */
export function CardFace({ card, className }: { card: Card; className?: string }) {
  const src = imageUrl(card);
  const assignments = card.assignments ?? [];
  // Per-card framing correction. Transforms read right-to-left: the picture is
  // zoomed about its centre first, then nudged by a percentage of the band's
  // own height — so the offset means the same thing at any zoom.
  const artTransform = `translateY(${imageOffsetOf(card.imageOffsetY)}%) scale(${imageScaleOf(card.imageScale)})`;

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
          <img
            src={src}
            alt={card.name}
            className="h-full w-full object-cover"
            style={{ transform: artTransform }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[2cqw] bg-deck-ink text-deck-teal">
            <ImageOff className="h-[10cqw] w-[10cqw]" />
            <span className="text-[3cqw] uppercase tracking-widest">{card.object}</span>
          </div>
        )}

        {/* Name plate — dark plum, top left, inside the safe margin */}
        <div
          className="absolute max-w-[66cqw] rounded-[2cqw] border-[0.45cqw] border-deck-mustard bg-deck-plum px-[2.5cqw] py-[1.2cqw]"
          style={{ left: SAFE_MARGIN, top: TITLE_INSET_TOP }}
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
        <CodeBubble code={card.code} style={{ right: SAFE_MARGIN, top: TITLE_INSET_TOP }} />
      </div>

      {/* Text plate — a hairline rule matching the name plate border, over a
          flat deep purple. The plate is the same plum as the name plate and
          code bubble, so the whole card reads as one issued system; internal
          hairline rules section the reading from the assignments, which is
          what makes the panel feel official rather than atmospheric. */}
      <div
        className="relative flex flex-1 flex-col border-t-[0.45cqw] border-deck-mustard bg-deck-plum"
        style={{
          paddingLeft: SAFE_MARGIN,
          paddingRight: SAFE_MARGIN,
          // Wider than the print margin at the bottom, so the last assignment
          // ends with air under it rather than on the margin line. The top edge
          // is the internal divider, not a card edge, so the print safe margin
          // does not apply there.
          paddingBottom: PLATE_PAD_BOTTOM,
          paddingTop: PLATE_PAD_TOP,
        }}
      >
        <Ornament />

        {/* Tagline — the character's truth in a sentence. */}
        <p
          className="shrink-0 text-center font-card-serif leading-[1.3] text-deck-mustard"
          style={{ fontSize: `${readingSize(card.tagline)}cqw` }}
        >
          {card.tagline}
        </p>

        {/* Section rule — the ASSIGNMENT label set into a hairline that runs
            the full plate width, so the label reads as a ruled-off section
            heading rather than a floating caption. The hairlines are dimmer
            than the top rule: internal structure, not the card's frame. */}
        {/* Held off the reading — the two are different voices and need air
            between them, not just a line break. The plate is tight: this
            offset, the padding and the line spacing together leave well under
            a line of slack, which is why a reading that wrapped to two lines
            would push the last assignment into the bottom margin. readingSize
            below is what stops that happening. */}
        <div className="mt-[4cqw] flex flex-1 flex-col gap-[1.4cqw]">
          <div className="flex items-center gap-[2.2cqw]">
            <div className="h-[0.3cqw] flex-1 bg-deck-mustard/40" />
            <div className="font-mono text-[2.8cqw] uppercase leading-none tracking-[0.42em] text-deck-purple">
              Assignments
            </div>
            <div className="h-[0.3cqw] flex-1 bg-deck-mustard/40" />
          </div>
          {assignments.length > 0 ? (
            <ul className="flex flex-1 flex-col justify-center space-y-[0.4cqw]">
              {assignments.map((entry, i) => (
                // Unbulleted and left-aligned — the lines carry themselves,
                // set in the card serif, uppercase and letterspaced: the same
                // voice as the field reading above, pitched as an inscription
                // rather than a UI label. The size is what lets a full-length
                // line (MAX_ASSIGNMENT_CHARS) hold one line.
                <li
                  key={i}
                  className="font-card-serif text-[3.5cqw] font-semibold uppercase leading-snug tracking-[0.09em] text-deck-cream"
                >
                  {entry}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-card-serif text-[3.5cqw] uppercase tracking-[0.09em] text-deck-teal/60">— no assignment yet —</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The field reading must hold one line: the plate has no room for a second, and
 * a wrap would push the last assignment inside the bottom print margin. A
 * reading longer than the deck has used so far steps down rather than wrapping.
 * ~54 characters fit at 4.2cqw, ~60 at 3.8cqw.
 */
function readingSize(reading: string) {
  return reading.length > 52 ? 3.8 : 4.2;
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
