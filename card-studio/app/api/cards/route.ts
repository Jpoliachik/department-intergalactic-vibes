import { NextResponse } from "next/server";
import { readState, writeCard } from "@/lib/deck";
import type { StoredCard } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/cards -> { cards, globals }
export async function GET() {
  try {
    const state = await readState();
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

// PUT /api/cards  body: { slug, patch }  -> updated card
export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as {
      slug?: string;
      patch?: Partial<StoredCard>;
    };
    if (!body.slug || !body.patch) {
      return NextResponse.json(
        { error: "Expected { slug, patch }." },
        { status: 400 },
      );
    }
    // Never let the client rewrite identity fields.
    const { slug: _s, order: _o, ...safe } = body.patch;
    const card = await writeCard(body.slug, safe);
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
