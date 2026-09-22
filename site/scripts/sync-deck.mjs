/**
 * Copies the deck out of card-studio and into the site: the card text as
 * src/deck.json, the art as hashed AVIF/WebP in public/cards, plus the fonts
 * and the 512px icon the site serves. Everything it writes is committed, so
 * the Vercel build never needs card-studio or sharp.
 *
 * Run it after changing anything in card-studio/deck:
 *
 *   npm run sync
 *
 * Idempotent — the same inputs give the same files, and anything in
 * public/cards the current deck no longer produces is deleted.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const root = path.resolve(site, "..");
const deckDir = path.join(root, "card-studio/deck");
const publicDir = path.join(site, "public");
const cardsDir = path.join(publicDir, "cards");

const WIDTHS = [440, 880];
const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 74, effort: 6 };

const COLOR = {
  black: "#000000", // matches export-brand's apple-touch-icon ground
  mustard: "#e8a929",
};

const kb = (n) => (n / 1024).toFixed(1).padStart(6) + " KB";
const hash8 = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);

// ─── 1 + 2. Deck text and art ────────────────────────────────────────────────

const cards = fs
  .readdirSync(deckDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(deckDir, d.name, "card.json")))
  .map((d) => JSON.parse(fs.readFileSync(path.join(deckDir, d.name, "card.json"), "utf8")))
  .sort((a, b) => a.order - b.order);

fs.mkdirSync(cardsDir, { recursive: true });
const written = new Set();
const sizes = [];

// Writes one encoded image as <slug>-<width>.<hash8>.<ext>; returns its URL.
const writeCardImage = (slug, width, ext, buf) => {
  const name = `${slug}-${width}.${hash8(buf)}.${ext}`;
  const file = path.join(cardsDir, name);
  if (!fs.existsSync(file)) fs.writeFileSync(file, buf);
  written.add(name);
  sizes.push({ name, ext, width, bytes: buf.length });
  return `/cards/${name}`;
};

const deck = [];
for (const card of cards) {
  const source = path.join(deckDir, card.slug, "image.png");
  const art = { avif: [], webp: [] };
  let src;

  for (const width of WIDTHS) {
    const resized = sharp(source).resize(width, width);
    const avif = await resized.clone().avif(AVIF).toBuffer();
    const webp = await resized.clone().webp(WEBP).toBuffer();
    art.avif.push(`${writeCardImage(card.slug, width, "avif", avif)} ${width}w`);
    const webpUrl = writeCardImage(card.slug, width, "webp", webp);
    art.webp.push(`${webpUrl} ${width}w`);
    src = webpUrl; // the widest WebP is the plain <img src> fallback
  }

  // Only the fields the site shows. wisdomRoot, sceneStory, object and the
  // studio's framing values stay in card-studio.
  deck.push({
    slug: card.slug,
    order: card.order,
    code: card.code,
    name: card.name,
    designation: card.designation,
    function: card.function,
    tagline: card.tagline,
    bio: card.bio,
    assignments: card.assignments,
    art: { avif: art.avif.join(", "), webp: art.webp.join(", "), src },
  });
}

fs.writeFileSync(path.join(site, "src/deck.json"), JSON.stringify(deck, null, 2) + "\n");
console.log(`wrote src/deck.json (${deck.length} cards)`);

// Anything left over is from an older version of the deck. Cleanup is
// confined to public/cards — nothing else in public/ is ours to delete.
for (const name of fs.readdirSync(cardsDir)) {
  if (!written.has(name)) {
    fs.rmSync(path.join(cardsDir, name));
    console.log(`removed stale public/cards/${name}`);
  }
}

console.log("\npublic/cards:");
for (const s of sizes) console.log(`  ${s.name.padEnd(40)} ${kb(s.bytes)}`);
for (const ext of ["avif", "webp"]) {
  const big = sizes.filter((s) => s.ext === ext && s.width === 880).map((s) => s.bytes);
  console.log(`  880px ${ext}: ${kb(Math.min(...big))} – ${kb(Math.max(...big))}`);
}
console.log(`  total: ${kb(sizes.reduce((n, s) => n + s.bytes, 0))}\n`);

// ─── 3. Fonts ────────────────────────────────────────────────────────────────
// Latin subsets only, under fixed names the CSS can point at.

const FONTS = {
  "plex-mono-400.woff2": "ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
  "plex-mono-400-italic.woff2": "ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff2",
  "plex-mono-500.woff2": "ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
  "cormorant-500-italic.woff2":
    "cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2",
};

fs.mkdirSync(path.join(publicDir, "fonts"), { recursive: true });
for (const [name, from] of Object.entries(FONTS)) {
  fs.copyFileSync(path.join(site, "node_modules/@fontsource", from), path.join(publicDir, "fonts", name));
  console.log(`wrote public/fonts/${name}`);
}

// ─── 4. Manifest icon ────────────────────────────────────────────────────────
// favicon.svg and apple-touch-icon.png are written by
// card-studio/scripts/export-brand.mjs — not here. This adds only the 512px
// icon (for a future manifest), drawn the same way as that touch icon: the
// mustard glyph at 62% on the black ground, opaque, straight from the
// exported mark so a change to the mark flows through.

const glyph = fs.readFileSync(path.join(root, "brand/mark/glyph.svg"), "utf8");
const glyphViewBox = glyph.match(/viewBox="([^"]+)"/)[1];
const glyphPaths = glyph
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<!--[\s\S]*?-->\s*/g, "")
  .replace('fill="currentColor"', `fill="${COLOR.mustard}"`);

const ICON_PX = 512;
const g = Math.round(ICON_PX * 0.62);
const o = (ICON_PX - g) / 2;
const icon =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_PX}" height="${ICON_PX}">` +
  `<rect width="${ICON_PX}" height="${ICON_PX}" fill="${COLOR.black}"/>` +
  `<svg x="${o}" y="${o}" width="${g}" height="${g}" viewBox="${glyphViewBox}">${glyphPaths}</svg></svg>`;
await sharp(Buffer.from(icon))
  .flatten({ background: COLOR.black })
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, "icon-512.png"));
console.log("wrote public/icon-512.png");

// og.png needs IBM Plex Mono, which sharp's SVG renderer can't load from a
// file — so it lives in scripts/og.mjs, which drives headless Chrome.
