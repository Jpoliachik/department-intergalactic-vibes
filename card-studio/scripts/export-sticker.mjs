/**
 * Production files for a circle sticker.
 *
 *   node scripts/export-sticker.mjs          # needs the dev server on :3000
 *
 * Renders /print/sticker in headless Chrome and writes, per size:
 *
 *   -diecut.png   transparent outside the cut. What the upload-a-PNG shops
 *                 (Sticker Mule and friends) want — they cut to the artwork edge.
 *   -bleed.png    the ground running to a square edge, for printers who ask for
 *                 bleed and place their own cut line.
 *   -guides.png   the same with the cut and safe circles drawn, for checking.
 *   .pdf          VECTOR, at true physical size, fonts embedded by Chrome. The
 *                 best single file to hand a print shop, and the one that does
 *                 not care what resolution they output at.
 *
 * No SVG here on purpose: VIBE and CORP are live text in a system face, and an
 * SVG carrying live text renders differently — or not at all — on a machine
 * without that font. The PDF has the glyphs embedded, so it does not have that
 * problem.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "../export/sticker");
const ORIGIN = process.env.ORIGIN ?? "http://localhost:3000";

const BLEED_MM = 3.175;
const SIZES_MM = [51, 76, 102];          // 2in, 3in, 4in
const DPI = 300;
const mm2px = (mm, dpi) => Math.round((mm / 25.4) * dpi);
const mm2in = (mm) => mm / 25.4;

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  args: ["--force-device-scale-factor=1", "--font-render-hinting=none"],
});
try {
  const page = await browser.newPage();
  for (const mm of SIZES_MM) {
    const totalMm = mm + 2 * BLEED_MM;   // the artwork square, bleed included
    const px = mm2px(totalMm, DPI);
    const inch = (mm / 25.4).toFixed(0);
    const stem = `vibe-corp-sticker-${inch}in-${mm}mm`;

    for (const [suffix, q] of [
      ["diecut", "flavour=diecut"],
      ["bleed", "flavour=bleed"],
      ["guides", "flavour=bleed&guides=1"],
    ]) {
      await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 });
      await page.goto(`${ORIGIN}/print/sticker?px=${px}&mm=${mm}&${q}`, { waitUntil: "networkidle0" });
      const el = await page.waitForSelector("#sticker-canvas");
      await el.screenshot({ path: path.join(OUT, `${stem}-${suffix}.png`), omitBackground: true });
    }

    // Vector. The page is laid out in CSS pixels at 96/inch, so the PDF page is
    // sized in inches to match and Chrome writes the shapes as paths.
    const cssPx = Math.round(mm2in(totalMm) * 96);
    await page.setViewport({ width: cssPx, height: cssPx, deviceScaleFactor: 1 });
    await page.goto(`${ORIGIN}/print/sticker?px=${cssPx}&mm=${mm}&flavour=bleed`, { waitUntil: "networkidle0" });
    await page.pdf({
      path: path.join(OUT, `${stem}.pdf`),
      width: `${mm2in(totalMm)}in`,
      height: `${mm2in(totalMm)}in`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });

    console.log(
      `${stem}: ${px}x${px}px @ ${DPI}dpi — ${mm}mm cut + ${BLEED_MM}mm bleed = ${totalMm.toFixed(1)}mm artwork, + pdf`,
    );
  }

  fs.writeFileSync(
    path.join(OUT, "READ-ME-BEFORE-ORDERING.txt"),
    [
      "VIBE CORP — circle sticker artwork",
      "",
      `Cut sizes: ${SIZES_MM.map((m) => `${(m / 25.4).toFixed(0)}in (${m}mm)`).join(", ")}`,
      `Bleed: ${BLEED_MM}mm all round (the trade's usual 1/8in).`,
      `Safe margin: ${BLEED_MM}mm inside the cut. The emblem's outer rule sits exactly on it.`,
      "",
      "WHICH FILE TO SEND",
      "  *.pdf            Best. Vector, true physical size, fonts embedded.",
      "  *-diecut.png     For upload-a-PNG shops that cut to the artwork edge.",
      "                   Transparent outside the circle. 300dpi.",
      "  *-bleed.png      For printers who ask for bleed and set their own cut line.",
      "  *-guides.png     NOT for printing. The cut (red) and safe (teal) circles",
      "                   drawn, so you can check clearances.",
      "",
      "COLOURS",
      "  Ground  #5c3d82   Ink  #f3e9d6",
      "  Contrast 7.1:1. If a printer offers Pantone, the nearest coated matches",
      "  are worth asking about rather than guessing here.",
      "",
      "Regenerate: cd card-studio && node scripts/export-sticker.mjs",
    ].join("\n") + "\n",
  );
  console.log("wrote READ-ME-BEFORE-ORDERING.txt");
} finally {
  await browser.close();
}
