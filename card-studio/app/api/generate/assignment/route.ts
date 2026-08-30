import { NextResponse } from "next/server";
import { readCard, readGlobals, writeCard } from "@/lib/deck";
import { generateText } from "@/lib/anthropic";
import { render } from "@/lib/prompts";
import { ASSIGNMENT_COUNT } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(text: string): string {
  return text
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
}

/**
 * The model is asked for one entry per line. Be tolerant about what comes
 * back: strip list markers, drop blanks, and keep only the first two lines.
 */
function parseAssignments(text: string): string[] {
  const entries = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s*/, ""))
    .map((line) => line.replace(/^\s*(?:entry\s*\d*|your assignment)\s*[:.\u2014-]\s*/i, ""))
    .map(clean)
    .filter(Boolean)
    .slice(0, ASSIGNMENT_COUNT);
  if (entries.length < ASSIGNMENT_COUNT) {
    throw new Error(
      `Expected ${ASSIGNMENT_COUNT} assignment lines, got ${entries.length}. Raw output:\n${text}`,
    );
  }
  return entries;
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
    const assignments = parseAssignments(
      await generateText({ model: globals.textModel, prompt, maxTokens: 512 }),
    );
    const updated = await writeCard(slug, { assignments });
    return NextResponse.json({ card: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
