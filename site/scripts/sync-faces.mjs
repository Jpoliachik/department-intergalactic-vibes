/**
 * Copies the finished card faces out of card-studio for the hidden directory
 * page (/directory): each card exactly as printed, trimmed to the 63×88mm
 * card, as hashed AVIF/WebP in public/faces and src/faces.json.
 *
 * The faces are screenshots of card-studio's own /print/<slug> page, the same
 * one the print export shoots, so the directory shows the one card face in the
 * codebase rather than a copy of it. That needs the studio running:
 *
 *   cd card-studio && npm run dev        # :3000, or set ORIGIN
 *   cd site && npm run sync:faces
 *
 * Separate from `npm run sync` because of that dev server. Run it after
 * changing anything on a card face. Idempotent, and anything in public/faces
 * the current deck no longer produces is deleted.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const root = path.resolve(site, "..");
const facesDir = path.join(site, "public/faces");
const ORIGIN = process.env.ORIGIN ?? "http://localhost:3000";

// The site doesn't depend on puppeteer; card-studio already has it.
const require = createRequire(path.join(root, "card-studio/package.json"));
const { default: puppeteer } = await import(pathToFileURL(require.resolve("puppeteer")).href);

const WIDTHS = [360, 720];
const AVIF = { quality: 55, effort: 6 };
const WEBP = { quality: 78, effort: 6 };

const hash8 = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
const kb = (n) => (n / 1024).toFixed(1).padStart(6) + " KB";

// Same order as the channel's deck.json, which `npm run sync` keeps current.
const deck = JSON.parse(fs.readFileSync(path.join(site, "src/deck.json"), "utf8"));

const browser = await puppeteer.launch({
  headless: true,
  // Chrome refuses to sandbox as root, which is how containers and CI run.
  args: ["--force-device-scale-factor=1", "--font-render-hinting=none", ...(process.getuid?.() === 0 ? ["--no-sandbox"] : [])],
});

const shots = [];
try {
  const page = await browser.newPage();
  // The print page is laid out at 300dpi in CSS pixels: trim plus bleed.
  await page.setViewport({ width: 816, height: 1110, deviceScaleFactor: 1 });
  for (const card of deck) {
    const res = await page.goto(`${ORIGIN}/print/${card.slug}`, { waitUntil: "networkidle0" });
    if (res?.status() !== 200) throw new Error(`${ORIGIN}/print/${card.slug} answered ${res?.status()}. Is card-studio running?`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    // The trim box, centred inside the bleed canvas. The bleed is for the
    // guillotine; the directory shows the card as it's held.
    const trim = await page.$("#card-canvas > div");
    if (!trim) throw new Error(`${card.slug}: card face did not render`);
    shots.push({ card, png: await trim.screenshot({ type: "png" }) });
  }
} finally {
  await browser.close();
}

fs.mkdirSync(facesDir, { recursive: true });
const written = [];
const faces = {};
for (const { card, png } of shots) {
  const set = { avif: [], webp: [] };
  let src;
  for (const width of WIDTHS) {
    const resized = sharp(png).resize({ width });
    for (const ext of ["avif", "webp"]) {
      const buf = await resized.clone()[ext](ext === "avif" ? AVIF : WEBP).toBuffer();
      const name = `${card.slug}-${width}.${hash8(buf)}.${ext}`;
      if (!fs.existsSync(path.join(facesDir, name))) fs.writeFileSync(path.join(facesDir, name), buf);
      written.push({ name, bytes: buf.length });
      set[ext].push(`/faces/${name} ${width}w`);
      if (ext === "webp") src = `/faces/${name}`; // the widest WebP is the <img src> fallback
    }
  }
  faces[card.slug] = { avif: set.avif.join(", "), webp: set.webp.join(", "), src };
}

fs.writeFileSync(path.join(site, "src/faces.json"), JSON.stringify(faces, null, 2) + "\n");
console.log(`wrote src/faces.json (${Object.keys(faces).length} faces)`);

const keep = new Set(written.map((w) => w.name));
for (const name of fs.readdirSync(facesDir)) {
  if (!keep.has(name)) {
    fs.rmSync(path.join(facesDir, name));
    console.log(`removed stale public/faces/${name}`);
  }
}
for (const w of written) console.log(`  ${w.name.padEnd(40)} ${kb(w.bytes)}`);
console.log(`  total: ${kb(written.reduce((n, w) => n + w.bytes, 0))}`);
