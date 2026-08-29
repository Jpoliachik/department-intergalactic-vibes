import { NextResponse } from "next/server";
import { readCard, readGlobals, writeCard, writeImage } from "@/lib/deck";
import { generateImage } from "@/lib/gemini";
import { render } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/generate/image  body: { slug }  -> { card }
// Uses the card's stored imagePrompt. If empty, builds one from the global
// template first (and saves it) so it's visible and editable afterwards.
export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as { slug?: string };
    if (!slug) {
      return NextResponse.json({ error: "Expected { slug }." }, { status: 400 });
    }
    const [card, globals] = await Promise.all([readCard(slug), readGlobals()]);

    let prompt = card.imagePrompt?.trim() ?? "";
    if (!prompt) {
      prompt = render(globals.imagePrompt, card);
      await writeCard(slug, { imagePrompt: prompt });
    }

    const bytes = await generateImage({ model: globals.imageModel, prompt });
    const updated = await writeImage(slug, bytes);
    return NextResponse.json({ card: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
