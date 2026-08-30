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
  /** The one-line koan issued with the draw. */
  fieldReading: string;

  // --- Source variables (edited by hand; feed the generators) ---
  /** Short in-world description of who this character is. */
  bio: string;
  /** The two-sentence, present-tense scene the card depicts. */
  sceneStory: string;

  // --- Generated / editable outputs ---
  /** The card's tagline (AI-generatable). */
  tagline: string;
  /** The "Your Assignment" line shown on the card (AI-generatable). */
  assignment: string;
  /** The image-generation prompt for this card (editable; built from the global template). */
  imagePrompt: string;

  // --- Runtime-only (not persisted; computed on read) ---
  /** True if deck/<slug>/image.png exists. */
  hasImage?: boolean;
  /** ISO mtime of the image file, used for cache-busting. */
  imageUpdatedAt?: string | null;
}

/** The persisted card.json shape (everything except runtime-only fields). */
export type StoredCard = Omit<Card, "hasImage" | "imageUpdatedAt">;

/** Deck-wide, editable generation prompts + model choices. deck/globals.json. */
export interface Globals {
  /** Template for the image prompt. Interpolates card variables. */
  imagePrompt: string;
  /** Template for the Anthropic tagline generation prompt. */
  taglinePrompt: string;
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

export type GenerateKind = "tagline" | "assignment" | "image";
