// Small things around the edges of the channel: a note for whoever opens
// the console, a tab title that notices when you look away, and a line for
// anyone who stays still long enough.

/* ---------- the console ---------- */

export function consoleNote() {
  const mark = "color:#e8a929;font:500 13px/1.6 ui-monospace,Menlo,monospace";
  const body = "color:#b9ad9c;font:12px/1.7 ui-monospace,Menlo,monospace";
  const sign = "color:#8a8092;font:italic 12px/1.7 ui-monospace,Menlo,monospace";
  console.log(
    "%c● 7.83 Hz\n%cOh, hello. You opened the back panel.\n" +
      "Most people just listen. You wanted to see what's doing the listening. Respect.\n\n" +
      "Nothing in here is broken. Some of it is just very old.\n" +
      "Please don't touch the frequency. It took a long time to find.\n" +
      "If something hums at you, hum back. It's only being polite.\n\n" +
      "%c— crew, Sol-3. Leave it the way you found it, or a little better.",
    mark,
    body,
    sign,
  );
}

/* ---------- the tab title ---------- */

/** While the tab is in the background, the channel keeps going without you;
 *  come back and it says so, briefly. */
export function watchTitle() {
  const base = document.title;
  let restore = 0;
  document.addEventListener("visibilitychange", () => {
    clearTimeout(restore);
    if (document.hidden) {
      document.title = "… still listening";
    } else {
      document.title = "Signal restored";
      restore = window.setTimeout(() => (document.title = base), 2600);
    }
  });
}

/* ---------- staying still ---------- */

const IDLE_LINES = [
  "Still here? So are we.",
  "Take your time. The channel isn't going anywhere.",
  "Quiet registers too.",
  "No rush. Most of the good signal comes in slow.",
];

/** After a long stillness on a settled screen, one faint line surfaces at the
 *  foot of it. Once per screen; any touch, key or scroll starts the wait over. */
export function watchIdle(main: HTMLElement, afterMs = 100_000) {
  let timer = 0;
  const arm = () => {
    clearTimeout(timer);
    timer = window.setTimeout(surface, afterMs);
  };
  const surface = () => {
    const settled = main.querySelector(".choices") && !main.querySelector(".idle, .typing");
    if (!settled || document.hidden) return arm();
    const line = document.createElement("p");
    line.className = "p dim idle";
    line.textContent = IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)];
    main.append(line);
  };
  for (const ev of ["pointerdown", "keydown", "scroll", "visibilitychange"]) document.addEventListener(ev, arm, { passive: true });
  arm();
}
