"use client";

import { ImageOff } from "lucide-react";
import type { Card } from "@/lib/types";
import { imageUrl } from "@/lib/client";
import { cn } from "@/lib/utils";

/**
 * The composited card face: the generated art with the name, tagline and
 * assignment overlaid. A simple default frame in the deck palette — the real
 * print frame comes later; this is for reviewing the set.
 */
export function CardFace({ card, className }: { card: Card; className?: string }) {
  const src = imageUrl(card);

  return (
    <div
      className={cn(
        "relative flex aspect-[63/88] w-full flex-col overflow-hidden rounded-xl border border-div-purple/40 bg-div-indigo-deep text-div-star shadow-lg",
        className,
      )}
    >
      {/* Art */}
      <div className="relative flex-1 overflow-hidden">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={card.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-div-indigo to-div-indigo-deep text-div-purple/70">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs uppercase tracking-widest">
              {card.object}
            </span>
          </div>
        )}
        {/* Code chip */}
        <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-div-star/80 backdrop-blur">
          {card.code}
        </span>
      </div>

      {/* Text plate */}
      <div className="space-y-1.5 border-t border-div-purple/30 bg-gradient-to-b from-div-indigo to-div-indigo-deep px-3 py-3">
        <div className="text-center text-[10px] uppercase tracking-[0.25em] text-div-purple/80">
          {card.designation}
        </div>
        <div className="text-center font-semibold uppercase tracking-[0.18em] text-div-star">
          {card.name}
        </div>
        {card.tagline ? (
          <div className="text-center text-sm italic text-div-amber">
            “{card.tagline}”
          </div>
        ) : (
          <div className="text-center text-xs italic text-div-purple/50">
            — no tagline yet —
          </div>
        )}
        <div className="mx-auto h-px w-10 bg-div-purple/40" />
        <p className="min-h-[2.5rem] text-center text-[11px] leading-snug text-div-star/85">
          {card.assignment || (
            <span className="text-div-purple/50">— no assignment yet —</span>
          )}
        </p>
      </div>
    </div>
  );
}
