// Physical format of a printed card, and the one place the art's shape is set.
//
// The art slot and the aspect ratio requested from the image model are derived
// from the same numbers here. Change the shape in one place or they drift, and
// drift shows up as cropped heads and off-centre framing.

/** Card trim size in mm (63 x 88 — standard tarot/poker stock). */
export const CARD_WIDTH_MM = 63;
export const CARD_HEIGHT_MM = 88;

/**
 * The art is a square band across the top of the card: full card width, and
 * the same again in height. Gemini only offers discrete aspect ratios, so the
 * slot is built to match one of them exactly rather than cropping to fit.
 */
export const ART_ASPECT_RATIO = "1:1";

/** Art height as a fraction of card height — 63/88 ≈ 0.716. */
export const ART_HEIGHT_FRACTION = CARD_WIDTH_MM / CARD_HEIGHT_MM;

/** Print safe margin for readable content, as a percentage of card width. */
export const SAFE_MARGIN = "7cqw";

/**
 * The wisdom passage under the tagline: 2-3 short lines, each set on its own
 * line so the line breaks are authored rather than left to wrapping. The
 * character limit is what one line holds at the current type size, so it is a
 * hard limit, not a style preference — enforced when generating and surfaced
 * as a counter in the editor.
 */
export const MAX_ASSIGNMENT_CHARS = 42;
export const ASSIGNMENT_MIN_LINES = 2;
export const ASSIGNMENT_MAX_LINES = 3;
