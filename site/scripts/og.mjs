/**
 * Writes public/og.png, the 1200×630 link unfurl: the mustard glyph and two
 * lines of IBM Plex Mono on the site's ground.
 *
 * Separate from sync-deck.mjs because the type has to be real Plex Mono, and
 * sharp's SVG renderer won't load a webfont — so this screenshots a tiny page
 * in headless Chrome, borrowing puppeteer from card-studio. Run by
 * `npm run sync`.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const root = path.resolve(site, "..");

// The site doesn't depend on puppeteer; card-studio already has it.
const require = createRequire(path.join(root, "card-studio/package.json"));
const { default: puppeteer } = await import(pathToFileURL(require.resolve("puppeteer")).href);

const font = (file) =>
  "data:font/woff2;base64," + fs.readFileSync(path.join(site, "public/fonts", file)).toString("base64");

// Brand colours from brand/tokens.json; the ground is the site's own, a step below plum.
const { palette } = JSON.parse(fs.readFileSync(path.join(root, "brand/tokens.json"), "utf8"));
const C = { mustard: palette.mustard.hex, plum: palette.plum.hex, cream: palette.cream.hex, ground: "#120a1b" };

const glyph = fs
  .readFileSync(path.join(root, "brand/mark/glyph.svg"), "utf8")
  .replace(/<!--[\s\S]*?-->\s*/g, "")
  .replace("<svg ", '<svg width="120" height="120" ')
  .replace('fill="currentColor"', `fill="${C.mustard}"`);

const html = `<!doctype html>
<style>
  @font-face { font-family: Plex; font-weight: 400; src: url(${font("plex-mono-400.woff2")}) format("woff2"); }
  @font-face { font-family: Plex; font-weight: 500; src: url(${font("plex-mono-500.woff2")}) format("woff2"); }
  html, body { margin: 0; width: 1200px; height: 630px; }
  body {
    background: radial-gradient(ellipse 85% 75% at 50% -12%, ${C.plum} 0%, ${C.ground} 72%);
    display: flex; align-items: center; justify-content: center; gap: 48px;
    font-family: Plex, monospace; -webkit-font-smoothing: antialiased;
  }
  svg { flex: none; }
  .signal { color: ${C.cream}; font-size: 58px; font-weight: 400; letter-spacing: -0.01em; line-height: 1; }
  .url { color: ${C.mustard}; font-size: 21px; font-weight: 500; letter-spacing: 0.34em;
         text-transform: uppercase; margin-top: 22px; }
</style>
<body>
  ${glyph}
  <div>
    <div class="signal">Signal detected.</div>
    <div class="url">vibecorp.live</div>
  </div>
</body>`;

// Software rendering in sRGB, so the gradient comes out pixel-identical every
// run and og.png only changes when the design does.
const browser = await puppeteer.launch({
  headless: true,
  args: ["--disable-gpu", "--force-color-profile=srgb"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Both faces are in use on the page, so both must have actually loaded.
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === "loaded").length === 2,
  );
  if (!loaded) throw new Error("IBM Plex Mono did not load — og.png would fall back");
  await page.screenshot({ path: path.join(site, "public/og.png") });
  console.log("wrote public/og.png");
} finally {
  await browser.close();
}
