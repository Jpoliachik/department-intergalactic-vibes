import { Stamp } from "@/components/brand/stamp";

/**
 * The stamp alone on a bare, transparent page at an exact pixel size, for the
 * export script to screenshot. Same reasoning as the card print page: there is
 * one Stamp component in this codebase, and the stamp maker gets it.
 *
 * ?px=<n> sets the square size; ?plain=1 drops the bead ring.
 */
export default function StampPrintPage({
  searchParams,
}: {
  searchParams: { px?: string; plain?: string };
}) {
  const px = Math.max(32, Math.min(8000, Number(searchParams.px) || 354));
  return (
    <main style={{ margin: 0, background: "transparent" }}>
      <div id="stamp-canvas" style={{ width: px, height: px }}>
        <Stamp
          style={{ width: px, height: px, display: "block" }}
          beaded={searchParams.plain !== "1"}
        />
      </div>
    </main>
  );
}
