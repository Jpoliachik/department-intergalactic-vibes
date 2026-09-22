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

/** Must match the rendered <picture> so a preload is a cache hit. */
export const ART_SIZES = "(max-width: 472px) calc(100vw - 32px), 440px";

let avif: Promise<boolean> | undefined;
const avifSupported = () =>
  (avif ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  }));

/** Fetch and decode a card's art. Never rejects: a slow or failed image
 *  shouldn't hold the channel hostage. */
export async function preloadArt(c: Card): Promise<void> {
  const img = new Image();
  img.sizes = ART_SIZES;
  img.srcset = (await avifSupported()) ? c.art.avif : c.art.webp;
  img.src = c.art.src;
  const giveUp = new Promise((r) => setTimeout(r, 8000));
  await Promise.race([img.decode().catch(() => {}), giveUp]); // rendered anyway; the <img> retries
}
