// Small physical ticks. Android has navigator.vibrate. iPhone Safari has no
// haptics API, but on iOS 18+ toggling a switch control plays the system
// tick, so that's what iOS gets: a fresh hidden switch, clicked and removed.
// It's best-effort (iOS may only honour it straight from a tap, and not at
// all with System Haptics off). Nothing fires before the visitor has
// touched the page, or under reduced motion.

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const iOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

function switchTick() {
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.display = "none";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.append(input);
  document.head.append(label);
  label.click();
  label.remove();
}

const touched = () => navigator.userActivation?.hasBeenActive ?? true;

let last = 0;

/** `tap` for a pick; `type` for the typewriter, throttled so it hums rather than buzzes. */
export function tick(kind: "tap" | "type") {
  if (motion.matches || !touched()) return;
  const now = performance.now();
  if (kind === "type" && now - last < 45) return;
  last = now;
  if (iOS) switchTick();
  else navigator.vibrate?.(kind === "tap" ? 10 : 4);
}
