import { Sticker } from "@/components/brand/sticker";

/**
 * The sticker alone on a bare page at an exact pixel size, for the export
 * script to screenshot and to print to PDF. Same reasoning as the card and the
 * stamp: one component in the codebase, and the printer gets it.
 *
 * ?px=<n>  square size   ?mm=<n>  cut diameter   ?flavour=bleed|diecut
 */
export default function StickerPrintPage({
  searchParams,
}: {
  searchParams: { px?: string; mm?: string; flavour?: string; guides?: string; bg?: string };
}) {
  const px = Math.max(32, Math.min(9000, Number(searchParams.px) || 900));
  const mm = Math.max(10, Math.min(500, Number(searchParams.mm) || 76));
  const flavour = (["bleed", "circle", "diecut"] as const).find((f) => f === searchParams.flavour) ?? "diecut";
  // Only a literal hex is accepted — this string lands in a fill attribute.
  const bg = /^#[0-9a-fA-F]{6}$/.test(searchParams.bg ?? "") ? searchParams.bg : undefined;
  return (
    <main style={{ margin: 0, background: "transparent" }}>
      {/* globals.css paints an opaque dark body, which silently beats
          puppeteer's omitBackground and shipped a near-black square inside a
          file that was supposed to be transparent. The page has to knock it
          out itself. */}
      <style>{"html,body{background:transparent !important}"}</style>
      <div id="sticker-canvas" style={{ width: px, height: px }}>
        <Sticker
          style={{ width: px, height: px, display: "block" }}
          cutMm={mm}
          flavour={flavour}
          ground={bg}
          guides={searchParams.guides === "1"}
        />
      </div>
    </main>
  );
}
