"use client";

import { ImageOff } from "lucide-react";
import type { Card } from "@/lib/types";
import { imageUrl } from "@/lib/client";
import { cn } from "@/lib/utils";

/**
 * The composited card face: full-bleed art on the top 65%, with the name plate
 * and seal floating over it, and a text plate below.
 *
 * PRINT MARGIN — the rule for this deck: art may bleed to the trim edge, but no
 * readable content ever may. Every text element, plate and mark sits inside a
 * 5% safe margin on all four edges, so a trim that drifts eats only artwork.
 * `SAFE` below is that margin; use it for anything new that carries meaning.
 *
 * Everything is sized in `cqw` (percent of card width) against a container
 * query on the root, so the face is resolution-independent: the grid preview
 * and a 63x88mm print are the same design, not two different ones.
 */

/** Print safe margin, as a percentage of card width. */
const SAFE = "5cqw";

export function CardFace({ card, className }: { card: Card; className?: string }) {
  const src = imageUrl(card);
  const assignments = card.assignments ?? [];

  return (
    <div
      className={cn(
        "relative flex aspect-[63/88] w-full flex-col overflow-hidden rounded-xl border border-div-purple/40 bg-div-indigo-deep text-div-star shadow-lg [container-type:inline-size]",
        className,
      )}
    >
      {/* Art — full bleed, top 65% */}
      <div className="relative h-[65%] shrink-0 overflow-hidden">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={card.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[2cqw] bg-gradient-to-b from-div-indigo to-div-indigo-deep text-div-purple/70">
            <ImageOff className="h-[10cqw] w-[10cqw]" />
            <span className="text-[3cqw] uppercase tracking-widest">{card.object}</span>
          </div>
        )}

        {/* Scrim so the overlays stay readable over any art */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/55 to-transparent" />

        {/* Name plate — top left, inside the safe margin */}
        <div
          className="absolute max-w-[60cqw] rounded-[2cqw] border border-div-purple/40 bg-black/45 px-[2.5cqw] py-[1.4cqw] backdrop-blur-sm"
          style={{ left: SAFE, top: SAFE }}
        >
          <div className="truncate text-[4.4cqw] font-semibold uppercase leading-tight tracking-[0.16em] text-div-star">
            {card.name}
          </div>
          <div className="truncate text-[2.6cqw] uppercase leading-tight tracking-[0.2em] text-div-purple/90">
            {card.designation}
          </div>
        </div>

        {/* Seal — top right, inside the safe margin */}
        <Seal style={{ right: SAFE, top: SAFE }} />
      </div>

      {/* Text plate — content vertically centred in the remaining 35% */}
      <div
        className="flex flex-1 flex-col justify-center gap-[3cqw] border-t border-div-purple/30 bg-gradient-to-b from-div-indigo to-div-indigo-deep"
        style={{ paddingLeft: SAFE, paddingRight: SAFE, paddingBottom: SAFE, paddingTop: SAFE }}
      >
        {card.tagline ? (
          <div className="text-center text-[4cqw] italic leading-snug text-div-amber">
            “{card.tagline}”
          </div>
        ) : (
          <div className="text-center text-[4cqw] italic text-div-purple/50">
            — no tagline yet —
          </div>
        )}

        <div className="mx-auto h-px w-[12cqw] shrink-0 bg-div-purple/40" />

        <div className="space-y-[2cqw] text-left">
          <div className="text-[2.6cqw] uppercase tracking-[0.22em] text-div-purple/70">
            Your Assignment
          </div>
          {assignments.length > 0 ? (
            <ul className="space-y-[2cqw]">
              {assignments.map((entry, i) => (
                <li key={i} className="flex gap-[2cqw]">
                  <span
                    aria-hidden
                    className="mt-[1.5cqw] h-[1.1cqw] w-[1.1cqw] shrink-0 rounded-full bg-div-amber/80"
                  />
                  <span className="text-[4cqw] leading-snug text-div-star/90">
                    {entry}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[4cqw] italic text-div-purple/50">— no assignment yet —</p>
          )}
        </div>
      </div>
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
      className="absolute flex h-[11cqw] w-[11cqw] items-center justify-center rounded-full border border-div-star/50 bg-black/40 backdrop-blur-sm"
    >
      <span className="text-[3cqw] font-semibold tracking-[0.08em] text-div-star/80">
        VC
      </span>
    </div>
  );
}
