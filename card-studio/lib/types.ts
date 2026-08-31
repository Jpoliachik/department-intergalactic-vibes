// Shared types for the Vibe Corp card studio.

/** A single card / character in the deck. Persisted at deck/<slug>/card.json. */
export interface Card {
  /** Folder name under deck/, also the stable id. e.g. "the-beacon". */
  slug: string;
  /** Sort order in the deck (0..15). */
  order: number;

  // --- Fixed metadata (from the deck design) ---
  /** Field name / face of the card. e.g. "The Beacon". */
  name: string;
  /** Official post. e.g. "Signal Lamp Operator". */
  designation: string;
  /** Classification code. e.g. "SL-04". */
  code: string;
  /** Where it sits on the Grid. e.g. "Radiance". */
  function: string;
  /** The post's symbol object. e.g. "Lantern". */
  object: string;
  /** The card's one-liner — the character's truth in a sentence. */
  tagline: string;

  // --- Source variables (edited by hand; feed the generators) ---
  /**
   * The classic wisdom the card points back to — tradition plus essence.
   * Grounds the bio, reading, and assignments; never printed or quoted.
   */
  wisdomRoot?: string;
  /** Short in-world description of who this character is. */
  bio: string;
  /** The two-sentence, present-tense scene the card depicts. */
  sceneStory: string;

  // --- Generated / editable outputs ---
  /**
   * The two standing assignments printed on the card (AI-generatable). Short
   * imperatives — actionable, open-ended, never something to tick off.
   */
  assignments: string[];

  // --- Art framing (hand-tuned per card; see lib/card-format.ts) ---
  /** Zoom applied to the art inside its band. 1 = the image fits exactly. */
  imageScale?: number;
  /** Vertical nudge as a percentage of the band's height. Negative = up. */
  imageOffsetY?: number;

  // --- Runtime-only (not persisted; computed on read) ---
  /** True if deck/<slug>/image.png exists. */
  hasImage?: boolean;
  /** ISO mtime of the image file, used for cache-busting. */
  imageUpdatedAt?: string | null;
}

/** The persisted card.json shape (everything except runtime-only fields). */
export type StoredCard = Omit<Card, "hasImage" | "imageUpdatedAt">;

/** Lines in the wisdom passage. See ASSIGNMENT_MIN/MAX_LINES in card-format. */
export const ASSIGNMENT_COUNT = 2;

/** Deck-wide, editable generation prompts + model choices. deck/globals.json. */
export interface Globals {
  /** Template for the image prompt. Interpolates card variables. */
  imagePrompt: string;
  /** Template for the Anthropic assignment generation prompt. */
  assignmentPrompt: string;
  /** Anthropic model id for text generation. */
  textModel: string;
  /** Gemini model id for image generation. */
  imageModel: string;
}

export interface StudioState {
  cards: Card[];
  globals: Globals;
}

export type GenerateKind = "assignment" | "image";
