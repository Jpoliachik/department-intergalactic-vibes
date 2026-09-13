/**
 * Rasterises the stamp for a stamp maker.
 *
 *   node scripts/export-stamp.mjs            # needs the dev server on :3000
 *
 * Renders /print/stamp in headless Chrome at exact print pixel sizes and
 * screenshots it on a transparent background. Same approach as the card
 * export: one component in the codebase, and the printer gets it.
 *
 * The die is a Trodat 4630 / 46030 — 30mm round. Sizes below are that diameter
 * at several resolutions, because vendors ask for different things and the
 * difference is free once the page renders at any size.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "../export/stamp");
const ORIGIN = process.env.ORIGIN ?? "http://localhost:3000";
const DIE_MM = 30;
const mm2px = (mm, dpi) => Math.round((mm / 25.4) * dpi);

const JOBS = [
  { name: `vibes-certified-${DIE_MM}mm-300dpi`, dpi: 300, plain: false },
  { name: `vibes-certified-${DIE_MM}mm-600dpi`, dpi: 600, plain: false },
  { name: `vibes-certified-${DIE_MM}mm-1200dpi`, dpi: 1200, plain: false },
  { name: `vibes-certified-${DIE_MM}mm-300dpi-plain`, dpi: 300, plain: true },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  args: ["--force-device-scale-factor=1", "--font-render-hinting=none"],
});
try {
  const page = await browser.newPage();
  for (const job of JOBS) {
    const px = mm2px(DIE_MM, job.dpi);
    await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 });
    const url = `${ORIGIN}/print/stamp?px=${px}${job.plain ? "&plain=1" : ""}`;
    await page.goto(url, { waitUntil: "networkidle0" });
    const el = await page.waitForSelector("#stamp-canvas");
    const file = path.join(OUT, `${job.name}.png`);
    // Transparent, so the stamp maker gets artwork rather than a white square
    // they have to key out.
    await el.screenshot({ path: file, omitBackground: true });
    // Some upload tools flatten transparency to BLACK, which would hand the
    // stamp maker a solid square. A white-ground copy costs one screenshot.
    await page.evaluate(() => (document.body.style.background = "#ffffff"));
    const onWhite = path.join(OUT, `${job.name}-onwhite.png`);
    await el.screenshot({ path: onWhite, omitBackground: false });
    await page.evaluate(() => (document.body.style.background = ""));
    console.log(`wrote export/stamp/${job.name}.png (+ -onwhite) — ${px}x${px}px @ ${job.dpi}dpi (${DIE_MM}mm)`);

    // Vector, once per construction. A stamp maker would rather have this than
    // any raster: the die is cut from outlines, so resolution never enters into
    // it. Sized in real millimetres so it drops in at the right physical size.
    if (job.dpi === 300) {
      const svg = await page.$eval("#stamp-canvas svg", (el, mm) => {
        const clone = el.cloneNode(true);
        // The on-page style pins a pixel size and would win over width/height.
        clone.removeAttribute("style");
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clone.setAttribute("width", mm + "mm");
        clone.setAttribute("height", mm + "mm");
        return clone.outerHTML;
      }, DIE_MM);
      const svgFile = path.join(OUT, `${job.name.replace(/-300dpi/, "")}.svg`);
      // The two words are LIVE TEXT in a system sans, not outlines — there is
      // no font-outlining tool in this project. On a machine without that face
      // the words reflow or vanish, so the PNG is the safer thing to hand a
      // vendor; the SVG is for anyone who can outline the text themselves.
      fs.writeFileSync(
        svgFile,
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<!-- Vibe Corp stamp, ${DIE_MM}mm. NOTE: VIBES / CERTIFIED are live text in a\n` +
          `     system sans-serif, not outlines. Convert text to paths before sending to\n` +
          `     a printer or stamp maker, or use the PNG. -->\n${svg}\n`,
      );
      console.log(`wrote ${path.basename(svgFile)} — ${DIE_MM}mm vector (text not outlined)`);
    }
  }
} finally {
  await browser.close();
}
