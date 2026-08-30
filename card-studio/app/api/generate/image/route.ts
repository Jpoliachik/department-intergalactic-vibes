import { NextResponse } from "next/server";
import { readCard, readGlobals, writeImage } from "@/lib/deck";
import { generateImage } from "@/lib/gemini";
import { render } from "@/lib/prompts";
import { ART_ASPECT_RATIO } from "@/lib/card-format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/generate/image  body: { slug }  -> { card }
// The prompt is always rendered fresh from the global template plus this
// card's variables. There is no per-card prompt to drift out of sync.
export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as { slug?: string };
    if (!slug) {
      return NextResponse.json({ error: "Expected { slug }." }, { status: 400 });
    }
    const [card, globals] = await Promise.all([readCard(slug), readGlobals()]);

    const prompt = render(globals.imagePrompt, card);

    const bytes = await generateImage({
      model: globals.imageModel,
      prompt,
      aspectRatio: ART_ASPECT_RATIO,
    });
    const updated = await writeImage(slug, bytes);
    return NextResponse.json({ card: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
