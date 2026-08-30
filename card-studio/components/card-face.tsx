"use client";

import { ImageOff } from "lucide-react";
import type { Card } from "@/lib/types";
import { imageUrl } from "@/lib/client";
import { cn } from "@/lib/utils";
import { ART_HEIGHT_FRACTION, SAFE_MARGIN } from "@/lib/card-format";

/**
 * The composited card face: full-bleed art across the top, with the name plate
 * and seal floating over it, and a text plate below.
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
          className="absolute max-w-[60cqw] rounded-[2cqw] border-[0.45cqw] border-deck-mustard bg-deck-black px-[2.5cqw] py-[1.2cqw]"
          style={{ left: SAFE_MARGIN, top: SAFE_MARGIN }}
        >
          <div className="truncate text-[4.4cqw] font-semibold uppercase leading-tight tracking-[0.16em] text-deck-cream">
            {card.name}
          </div>
          <div className="truncate text-[2.6cqw] uppercase leading-tight tracking-[0.2em] text-deck-mustard">
            {card.designation}
          </div>
        </div>

        {/* Seal — top right, inside the safe margin */}
        <Seal style={{ right: SAFE_MARGIN, top: SAFE_MARGIN }} />
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
          paddingTop: "3.5cqw",
          backgroundImage: PLATE_GRADIENT,
        }}
      >
        <Ornament />

        {/* Tagline sits static directly under the rule. */}
        {card.tagline ? (
          <div className="shrink-0 text-center text-[3.6cqw] italic leading-snug text-deck-mustard">
            “{card.tagline}”
          </div>
        ) : (
          <div className="shrink-0 text-center text-[3.6cqw] italic text-deck-teal/60">
            — no tagline yet —
          </div>
        )}

        {/* The wisdom passage owns the rest of the plate. */}
        <div className="flex flex-1 flex-col justify-center">
          {assignments.length > 0 ? (
            <p className="text-center font-card-serif text-[4.6cqw] font-medium leading-[1.42] text-deck-cream">
              {assignments.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-center font-card-serif text-[4.6cqw] italic text-deck-teal/60">
              — no wisdom yet —
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The divider ornament: a large diamond straddling the rule, flanked by two
 * small ones. Tarot-plate decoration — it is the one flourish on an otherwise
 * plain plate, so it carries the whole "this is a card, not a label" read.
 */
function Ornament() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[1.8cqw]">
      <span className="h-[1.6cqw] w-[1.6cqw] rotate-45 bg-deck-mustard" />
      <span className="flex h-[5.4cqw] w-[5.4cqw] rotate-45 items-center justify-center border-[0.45cqw] border-deck-black bg-deck-mustard">
        <span className="h-[2.2cqw] w-[2.2cqw] border-[0.32cqw] border-deck-black" />
      </span>
      <span className="h-[1.6cqw] w-[1.6cqw] rotate-45 bg-deck-mustard" />
    </div>
  );
}

/**
 * Placeholder for the Vibe Corp seal. Swap the inner mark for the real logo
 * once it exists — the ring and sizing are the slot it has to fit.
 */
function Seal({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className="absolute flex h-[11cqw] w-[11cqw] items-center justify-center rounded-full border-[0.45cqw] border-deck-mustard bg-deck-black"
    >
      <span className="text-[3cqw] font-semibold tracking-[0.08em] text-deck-mustard">
        VC
      </span>
    </div>
  );
}
