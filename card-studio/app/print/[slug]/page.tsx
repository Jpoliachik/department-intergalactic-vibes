import { notFound } from "next/navigation";
import { CardFace } from "@/components/card-face";
import {
  EXPORT_BLEED_HEIGHT_PX,
  EXPORT_BLEED_WIDTH_PX,
  EXPORT_WIDTH_PX,
} from "@/lib/card-format";
import { readCard } from "@/lib/deck";

/**
 * A single card face on a bare page at exact print pixel size, and nothing else
 * — no studio chrome, no page padding, no background. This is what the export
 * route screenshots, so what the printer gets is the same component the grid
 * shows, just measured in print pixels instead of screen ones.
 *
 * Two boxes: #card-canvas is the printer's page, trim plus 3mm of bleed, and
 * what gets shot. Inside it, centred, the trim box at its true size — the card
 * as designed. The face's own bands overhang into the bleed and the canvas
 * clips them.
 *
 * The preview's rounded corners and hairline border are dropped here: they are
 * a screen affordance, and a printed card is trimmed to a square-cornered
 * rectangle by the guillotine, not by us.
 */
export default async function PrintPage({
  params,
}: {
  params: { slug: string };
}) {
  const card = await readCard(params.slug).catch(() => null);
  if (!card) notFound();

  return (
    <main style={{ margin: 0, background: "transparent" }}>
      <div
        id="card-canvas"
        style={{
          width: EXPORT_BLEED_WIDTH_PX,
          height: EXPORT_BLEED_HEIGHT_PX,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ width: EXPORT_WIDTH_PX, flex: "none" }}>
          <CardFace
            card={card}
            bleed
            className="rounded-none border-0 shadow-none"
          />
        </div>
      </div>
    </main>
  );
}
