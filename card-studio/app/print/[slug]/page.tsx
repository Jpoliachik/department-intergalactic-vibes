import { notFound } from "next/navigation";
import { CardFace } from "@/components/card-face";
import { EXPORT_WIDTH_PX } from "@/lib/card-format";
import { readCard } from "@/lib/deck";

/**
 * A single card face on a bare page at exact print pixel width, and nothing
 * else — no studio chrome, no page padding, no background. This is what the
 * export route screenshots, so what the printer gets is the same component the
 * grid shows, just measured in print pixels instead of screen ones.
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
    <main
      // The export screenshots #card, not the page, so the page only has to
      // give the face its exact width and stay out of the way.
      id="card-page"
      style={{ width: EXPORT_WIDTH_PX, margin: 0, background: "transparent" }}
    >
      <div id="card" style={{ width: EXPORT_WIDTH_PX }}>
        <CardFace card={card} className="rounded-none border-0 shadow-none" />
      </div>
    </main>
  );
}
