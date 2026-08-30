"use client";

/**
 * The deck's star marks, shared by the card faces and the studio chrome so the
 * printed artifact and the tool it is built in wear the same insignia.
 *
 * Both are drawn in a 0-100 viewBox and sized entirely by the caller — `cqw` on
 * a card face, Tailwind sizes in the UI — so one shape holds at every scale.
 */

/** Four concave arms — a spark of light rather than a compass rose. */
const SPARK =
  "M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2 Z";

/** Seven points, one per star of the cluster. The mark proper. */
const SEVEN_POINT =
  "M50.0 6.0 L58.1 32.9 L84.2 22.5 L68.3 45.5 L92.7 59.6 L64.6 61.5 L69.0 89.2 L50.0 68.5 L31.0 89.2 L35.4 61.5 L7.3 59.6 L31.7 45.5 L15.8 22.5 L41.9 32.9 Z";

export function Star({
  points = 4,
  outlined = false,
  className,
  style,
}: {
  /** 7 for the cluster mark, 4 for the small sparks that attend it. */
  points?: 4 | 7;
  /** A black keyline, for when the star sits on mustard or busy art. */
  outlined?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <path
        d={points === 7 ? SEVEN_POINT : SPARK}
        fill="currentColor"
        stroke={outlined ? "#000000" : "none"}
        strokeWidth={outlined ? 7 : 0}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
    </svg>
  );
}
