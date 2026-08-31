import { promises as fs } from "fs";
import path from "path";
import { ASSIGNMENT_COUNT } from "./types";
import { imageOffsetOf, imageScaleOf } from "./card-format";
import type { Card, Globals, StoredCard, StudioState } from "./types";

// The deck data directory (JSON + PNGs), committed to git.
const DECK_DIR = path.join(process.cwd(), "deck");
const GLOBALS_PATH = path.join(DECK_DIR, "globals.json");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function imagePath(slug: string): string {
  return path.join(DECK_DIR, slug, "image.png");
}

export function cardPath(slug: string): string {
  return path.join(DECK_DIR, slug, "card.json");
}

async function fileStat(file: string) {
  try {
    return await fs.stat(file);
  } catch {
    return null;
  }
}

/**
 * Split a legacy single-string assignment into entries on sentence boundaries.
 * Old cards stored one two-sentence line; the card now shows two entries.
 */
function splitLegacyAssignment(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= ASSIGNMENT_COUNT) {
    // Fold any overflow into the final entry so nothing is silently dropped.
    const head = parts.slice(0, ASSIGNMENT_COUNT - 1);
    return [...head, parts.slice(ASSIGNMENT_COUNT - 1).join(" ")];
  }
  return parts;
}

/**
 * Tolerate older card.json shapes: `assignment` before it became `assignments`,
 * the per-card `imagePrompt` that the global template replaced, and
 * `fieldReading` from before it was renamed to `tagline`. Migrated or dropped
 * on the next write.
 */
function normalize(
  stored: StoredCard & { assignment?: string; imagePrompt?: string; fieldReading?: string },
): StoredCard {
  const { assignment, imagePrompt, fieldReading, ...rest } = stored;
  let assignments = Array.isArray(rest.assignments) ? rest.assignments : [];
  if (assignments.length === 0 && typeof assignment === "string" && assignment.trim()) {
    assignments = splitLegacyAssignment(assignment);
  }
  return {
    ...rest,
    tagline: rest.tagline ?? fieldReading ?? "",
    assignments,
    // Framing is clamped on the way in, so a hand-edited card.json can't push
    // the art somewhere the studio's controls could never bring it back from.
    imageScale: imageScaleOf(rest.imageScale),
    imageOffsetY: imageOffsetOf(rest.imageOffsetY),
  };
}

async function hydrate(stored: StoredCard): Promise<Card> {
  const stat = await fileStat(imagePath(stored.slug));
  return {
    ...stored,
    hasImage: !!stat,
    imageUpdatedAt: stat ? stat.mtime.toISOString() : null,
  };
}

export async function readGlobals(): Promise<Globals> {
  const globals = await readJson<Globals>(GLOBALS_PATH);
  // Env vars win over the stored model choices, so keys/models can be pinned locally.
  return {
    ...globals,
    textModel: process.env.TEXT_MODEL || globals.textModel,
    imageModel: process.env.IMAGE_MODEL || globals.imageModel,
  };
}

export async function writeGlobals(globals: Globals): Promise<void> {
  await writeJson(GLOBALS_PATH, globals);
}

export async function listCardSlugs(): Promise<string[]> {
  const entries = await fs.readdir(DECK_DIR, { withFileTypes: true });
  const slugs: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const stat = await fileStat(cardPath(entry.name));
    if (stat) slugs.push(entry.name);
  }
  return slugs;
}

export async function readCard(slug: string): Promise<Card> {
  const stored = await readJson<StoredCard>(cardPath(slug));
  return hydrate(normalize(stored));
}

export async function readAllCards(): Promise<Card[]> {
  const slugs = await listCardSlugs();
  const cards = await Promise.all(slugs.map((slug) => readCard(slug)));
  return cards.sort((a, b) => a.order - b.order);
}

export async function writeCard(slug: string, patch: Partial<StoredCard>): Promise<Card> {
  const current = normalize(await readJson<StoredCard>(cardPath(slug)));
  const next: StoredCard = { ...current, ...patch, slug: current.slug };
  await writeJson(cardPath(slug), next);
  return hydrate(next);
}

export async function writeImage(slug: string, bytes: Buffer): Promise<Card> {
  const dir = path.join(DECK_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(imagePath(slug), bytes);
  return readCard(slug);
}

export async function readState(): Promise<StudioState> {
  const [cards, globals] = await Promise.all([readAllCards(), readGlobals()]);
  return { cards, globals };
}
