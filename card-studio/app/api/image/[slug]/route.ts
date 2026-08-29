import { promises as fs } from "fs";
import { imagePath } from "@/lib/deck";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/image/<slug> -> the card's PNG bytes (or 404).
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const bytes = await fs.readFile(imagePath(params.slug));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
