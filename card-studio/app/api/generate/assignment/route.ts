import { NextResponse } from "next/server";
import { readCard, readGlobals, writeCard } from "@/lib/deck";
import { generateText } from "@/lib/anthropic";
import { render } from "@/lib/prompts";
import {
  ASSIGNMENT_MAX_LINES,
  ASSIGNMENT_MIN_LINES,
  MAX_ASSIGNMENT_CHARS,
} from "@/lib/card-format";

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
    .slice(0, ASSIGNMENT_MAX_LINES);
  if (entries.length < ASSIGNMENT_MIN_LINES) {
    throw new Error(
      `Expected ${ASSIGNMENT_MIN_LINES}-${ASSIGNMENT_MAX_LINES} wisdom lines, ` +
        `got ${entries.length}. Raw output:\n${text}`,
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

    // The plate fits one line per entry, so over-length output is a failure,
    // not a style nit. Ask again with the offenders quoted back rather than
    // erroring out on the first miss — the model reliably lands it on a retry.
    let assignments: string[] = [];
    let attemptPrompt = prompt;
    for (let attempt = 0; attempt < 3; attempt++) {
      assignments = parseAssignments(
        await generateText({ model: globals.textModel, prompt: attemptPrompt, maxTokens: 4096 }),
      );
      const tooLong = assignments.filter((e) => e.length > MAX_ASSIGNMENT_CHARS);
      if (tooLong.length === 0) break;
      if (attempt === 2) {
        throw new Error(
          `Could not get both entries under ${MAX_ASSIGNMENT_CHARS} characters in 3 tries. ` +
            `Last attempt: ${tooLong.map((e) => `"${e}" (${e.length})`).join(", ")}`,
        );
      }
      attemptPrompt =
        `${prompt}\n\nYour last attempt was too long: ` +
        `${tooLong.map((e) => `"${e}" (${e.length} chars)`).join(", ")}. ` +
        `Every entry must be ${MAX_ASSIGNMENT_CHARS} characters or fewer. Cut words, don't rephrase longer.`;
    }

    const updated = await writeCard(slug, { assignments });
    return NextResponse.json({ card: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
