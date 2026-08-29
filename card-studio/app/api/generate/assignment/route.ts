import { NextResponse } from "next/server";
import { readCard, readGlobals, writeCard } from "@/lib/deck";
import { generateText } from "@/lib/anthropic";
import { render } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(text: string): string {
  return text
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
}

// POST /api/generate/assignment  body: { slug }  -> { card }
export async function POST(req: Request) {
  try {
    const { slug } = (await req.json()) as { slug?: string };
    if (!slug) {
      return NextResponse.json({ error: "Expected { slug }." }, { status: 400 });
    }
    const [card, globals] = await Promise.all([readCard(slug), readGlobals()]);
    const prompt = render(globals.assignmentPrompt, card);
    const assignment = clean(
      await generateText({ model: globals.textModel, prompt, maxTokens: 512 }),
    );
    const updated = await writeCard(slug, { assignment });
    return NextResponse.json({ card: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
