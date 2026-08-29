import type { Card } from "./types";

/**
 * Interpolate {{variable}} placeholders in a template with card fields.
 * Unknown placeholders are left untouched so mistakes are visible, not silent.
 */
export function render(template: string, card: Card): string {
  const vars: Record<string, string> = {
    name: card.name,
    designation: card.designation,
    code: card.code,
    function: card.function,
    object: card.object,
    fieldReading: card.fieldReading,
    bio: card.bio,
    sceneStory: card.sceneStory,
    tagline: card.tagline,
    assignment: card.assignment,
  };
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    return key in vars ? vars[key] : match;
  });
}

/** The variable names available to templates, for the editor's help text. */
export const TEMPLATE_VARS = [
  "name",
  "designation",
  "code",
  "function",
  "object",
  "fieldReading",
  "bio",
  "sceneStory",
] as const;
