import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { EXPORT_DPI, EXPORT_WIDTH_PX } from "@/lib/card-format";
import { readAllCards } from "@/lib/deck";

export const dynamic = "force-dynamic";
// Rasterising sixteen cards through one browser takes longer than the default.
export const maxDuration = 300;

const EXPORT_DIR = path.join(process.cwd(), "export");

/**
 * Print export. Renders /print/<slug> in headless Chrome at the card's exact
 * print pixel width and screenshots the face, so the PNG is the same component
 * the studio shows — same fonts, same container-query sizing — measured at
 * 300dpi instead of on screen. Files land in card-studio/export/, gitignored.
 *
 * Screenshotting a real browser rather than redrawing the card in a canvas is
 * the point: there is one card face in this codebase, and the printer gets it.
 */
export async function POST(request: Request) {
  const { slugs } = (await request.json().catch(() => ({}))) as {
    slugs?: string[];
  };

  const cards = await readAllCards();
  const wanted = slugs?.length
    ? cards.filter((c) => slugs.includes(c.slug))
    : cards;
  if (wanted.length === 0) {
    return NextResponse.json({ error: "No cards to export" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  await fs.mkdir(EXPORT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    // The card is laid out in CSS pixels at print size already, so the device
    // scale factor stays at 1 — doubling it would give a 600dpi file, not a
    // sharper 300dpi one.
    args: ["--force-device-scale-factor=1", "--font-render-hinting=none"],
  });

  const written: string[] = [];
  const failed: { slug: string; error: string }[] = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: EXPORT_WIDTH_PX,
      height: Math.round((EXPORT_WIDTH_PX * 88) / 63),
      deviceScaleFactor: 1,
    });

    const shoot = async (card: (typeof wanted)[number]) => {
      const response = await page.goto(`${origin}/print/${card.slug}`, {
        waitUntil: "networkidle0",
      });
      // Next compiles routes on first request in dev, and a page that loses
      // that race answers 404. Screenshotting it would write a white PNG and
      // call it a card, so the status is checked before anything else.
      const status = response?.status() ?? 0;
      if (status !== 200) throw new Error(`Print page returned ${status}`);

      // Web fonts and the art both load after first paint; screenshotting
      // before either lands is how you get a card set in Times New Roman.
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                }),
            ),
        );
      });

      const element = await page.$("#card");
      if (!element) throw new Error("Card face did not render");

      const file = path.join(EXPORT_DIR, `${card.code}-${card.slug}.png`);
      await element.screenshot({ path: file, omitBackground: false });
      return path.basename(file);
    };

    for (const card of wanted) {
      try {
        written.push(await shoot(card));
      } catch {
        // One retry: the only failure seen in practice is the dev-server
        // compile race above, and by the second attempt the route is warm.
        try {
          written.push(await shoot(card));
        } catch (err) {
          failed.push({
            slug: card.slug,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
  } finally {
    await browser.close();
  }

  return NextResponse.json({
    dir: EXPORT_DIR,
    dpi: EXPORT_DPI,
    widthPx: EXPORT_WIDTH_PX,
    written,
    failed,
  });
}
