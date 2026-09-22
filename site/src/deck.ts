// The sixteen posts, as synced from card-studio/deck by `npm run sync`.
import deck from "./deck.json";

export type Card = (typeof deck)[number];
export const CARDS: Card[] = deck;

export const bySlug = (slug?: string) => CARDS.find((c) => c.slug === slug);

/** Accepts "GT-01", "gt01", "Gt 01"… */
export const byCode = (raw: string) => {
  const key = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return CARDS.find((c) => c.code.replace("-", "") === key);
};

/** "The Anchor" → "Anchor" */
export const shortName = (c: Card) => c.name.replace(/^The /, "");

/** A card's art: AVIF where the browser can, WebP otherwise, sized to the column. */
export function artPicture(c: Card): HTMLPictureElement {
  const pic = document.createElement("picture");
  pic.className = "art";
  const sizes = "(max-width: 472px) calc(100vw - 32px), 440px";
  for (const [type, srcset] of [["image/avif", c.art.avif], ["image/webp", c.art.webp]]) {
    pic.append(Object.assign(document.createElement("source"), { type, srcset, sizes }));
  }
  pic.append(Object.assign(new Image(880, 880), { src: c.art.src, alt: `Card art for ${c.name}`, decoding: "async" }));
  return pic;
}

/** Fetch and decode a card's art by building the same <picture> the screen
 *  will show, so the browser picks the same file and the render is a cache
 *  hit. Never rejects, and gives up after 8s: a slow image shouldn't hold
 *  the channel hostage. */
export async function preloadArt(c: Card): Promise<void> {
  const img = artPicture(c).querySelector("img")!;
  const giveUp = new Promise((r) => setTimeout(r, 8000));
  await Promise.race([img.decode().catch(() => {}), giveUp]);
}
