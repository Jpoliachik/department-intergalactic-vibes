import { NextResponse } from "next/server";
import { readGlobals, writeGlobals } from "@/lib/deck";
import type { Globals } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/globals  body: Globals  -> saved globals
export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<Globals>;
    const current = await readGlobals();
    const next: Globals = {
      imagePrompt: body.imagePrompt ?? current.imagePrompt,
      assignmentPrompt: body.assignmentPrompt ?? current.assignmentPrompt,
      textModel: body.textModel ?? current.textModel,
      imageModel: body.imageModel ?? current.imageModel,
    };
    await writeGlobals(next);
    return NextResponse.json({ globals: next });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
