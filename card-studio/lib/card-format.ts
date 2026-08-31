// Physical format of a printed card, and the one place the art's shape is set.
//
// The art slot and the aspect ratio requested from the image model are derived
// from the same numbers here. Change the shape in one place or they drift, and
// drift shows up as cropped heads and off-centre framing.

/** Card trim size in mm (63 x 88 — standard tarot/poker stock). */
export const CARD_WIDTH_MM = 63;
export const CARD_HEIGHT_MM = 88;

/**
 * The art is still requested square — Gemini only offers discrete aspect
 * ratios, and 1:1 is the one the scene prompts are written for.
 */
export const ART_ASPECT_RATIO = "1:1";

/**
 * The band the art is shown in, as a fraction of card height. A full square
 * band would be 63/88 ≈ 0.716; the band is deliberately shorter than that so
 * the text plate has room to breathe. The difference is taken out of the art:
 * object-cover trims it evenly top and bottom, and each card's own framing
 * (imageScale / imageOffsetY) decides what stays in view.
 */
export const ART_HEIGHT_FRACTION = 0.68;

/** Print safe margin for readable content, as a percentage of card width. */
export const SAFE_MARGIN = "7cqw";

/**
 * Where readable content actually sits from the left and right trim: the print
 * safe margin plus a visual margin on top of it, the same reasoning as
 * TITLE_INSET_TOP. Must never go below SAFE_MARGIN.
 */
export const SIDE_MARGIN = "11cqw";

/**
 * The text plate's own padding. The bottom sits deliberately wider than
 * SAFE_MARGIN so the last assignment has air under it rather than ending on
 * the margin line; it must never go below it. The top edge is the internal
 * divider, not a card edge, so the print margin does not apply there — the
 * value is set by the ornament straddling the rule.
 */
export const PLATE_PAD_TOP = "7cqw";
export const PLATE_PAD_BOTTOM = "11cqw";

/**
 * How far the name plate and code bubble sit from the top of the card: the
 * print safe margin plus a visual margin on top of it, so the title reads as
 * placed rather than as pushed up against the trim.
 */
export const TITLE_INSET_TOP = "13cqw";

/**
 * The two standing assignments printed on the card. Short imperatives, one
 * printed line each — the limit is what one line holds at the current type
 * size, enforced when generating and surfaced as a counter in the editor.
 */
export const MAX_ASSIGNMENT_CHARS = 34;
export const ASSIGNMENT_MIN_LINES = 2;
export const ASSIGNMENT_MAX_LINES = 2;

/**
 * IMAGE FRAMING — the art band is square and so is the generated image, so by
 * default the picture drops in one-to-one. The image model still frames the
 * figure where it likes, so each card carries a manual correction: a zoom and
 * a vertical nudge, applied in the card face as a CSS transform.
 *
 * `imageScale` is a multiplier (1 = fit the band exactly). `imageOffsetY` is a
 * percentage of the band's height — negative moves the picture up, positive
 * down. Scaling past 1 is what buys room to move without exposing an edge.
 */
export const IMAGE_SCALE_DEFAULT = 1;
export const IMAGE_SCALE_MIN = 1;
export const IMAGE_SCALE_MAX = 2;
export const IMAGE_OFFSET_DEFAULT = 0;
export const IMAGE_OFFSET_MIN = -25;
export const IMAGE_OFFSET_MAX = 25;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Coerce a stored/edited framing value, falling back to the neutral default. */
export function imageScaleOf(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : IMAGE_SCALE_DEFAULT;
  return clamp(n, IMAGE_SCALE_MIN, IMAGE_SCALE_MAX);
}

export function imageOffsetOf(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : IMAGE_OFFSET_DEFAULT;
  return clamp(n, IMAGE_OFFSET_MIN, IMAGE_OFFSET_MAX);
}
