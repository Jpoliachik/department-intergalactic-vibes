// Browser-side API helpers.
import type { Card, GenerateKind, Globals, StoredCard, StudioState } from "./types";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { error?: string }).error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function fetchState(): Promise<StudioState> {
  const res = await fetch("/api/cards", { cache: "no-store" });
  return jsonOrThrow<StudioState>(res);
}

export async function saveCard(
  slug: string,
  patch: Partial<StoredCard>,
): Promise<Card> {
  const res = await fetch("/api/cards", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, patch }),
  });
  const { card } = await jsonOrThrow<{ card: Card }>(res);
  return card;
}

export async function saveGlobals(globals: Globals): Promise<Globals> {
  const res = await fetch("/api/globals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(globals),
  });
  const data = await jsonOrThrow<{ globals: Globals }>(res);
  return data.globals;
}

export async function generate(
  kind: GenerateKind,
  slug: string,
): Promise<Card> {
  const res = await fetch(`/api/generate/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  const { card } = await jsonOrThrow<{ card: Card }>(res);
  return card;
}

/** Cache-busting image URL for a card, or null when it has no image yet. */
export function imageUrl(card: Card): string | null {
  if (!card.hasImage) return null;
  const v = card.imageUpdatedAt ? encodeURIComponent(card.imageUpdatedAt) : "1";
  return `/api/image/${card.slug}?t=${v}`;
}

export interface ExportResult {
  dir: string;
  dpi: number;
  widthPx: number;
  heightPx: number;
  written: string[];
  failed: { slug: string; error: string }[];
}

/** Rasterise the deck (or a subset) to print-resolution PNGs on disk. */
export async function exportDeck(slugs?: string[]): Promise<ExportResult> {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs }),
  });
  return jsonOrThrow<ExportResult>(res);
}
