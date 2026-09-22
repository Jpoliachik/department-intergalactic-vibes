// Small physical ticks. Android has navigator.vibrate. iPhone Safari has no
// haptics API, but on iOS 18+ toggling a hidden switch control plays the
// system tick, so that's the fallback. Both only fire after the visitor has
// touched the page, so nothing buzzes on arrival.

const motion = matchMedia("(prefers-reduced-motion: reduce)");

let label: HTMLLabelElement | undefined;
function switchTick() {
  if (!label) {
    label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.display = "none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.tabIndex = -1;
    label.append(input);
    document.body.append(label);
  }
  label.click();
}

const touched = () => navigator.userActivation?.hasBeenActive ?? true;

let last = 0;

/** `tap` for a pick; `type` for the typewriter, which is throttled so it hums rather than buzzes. */
export function tick(kind: "tap" | "type") {
  if (motion.matches || !touched()) return;
  const now = performance.now();
  if (kind === "type" && now - last < 45) return;
  last = now;
  if ("vibrate" in navigator) navigator.vibrate(kind === "tap" ? 10 : 4);
  else switchTick();
}
