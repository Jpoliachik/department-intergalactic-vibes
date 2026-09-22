// The screen engine. A screen is a few blocks of prose that type themselves
// out, then two to four choices. Everything else — transitions, the caret,
// skipping, the tuning bar — lives here so screens.ts can read like a script.

import { artPicture, type Card } from "./deck";
import { tick } from "./haptics";
import { meter } from "./meter/meter";

export type Block =
  | { kind: "p"; text: string; dim?: boolean; lead?: string }
  | { kind: "label"; text: string }
  | { kind: "serif"; text: string }
  | { kind: "stars"; items: string[] }
  | { kind: "card"; card: Card; faded?: boolean; resolve?: boolean }
  | { kind: "whisper"; text: string }
  | { kind: "pause"; ms: number };

export type Choice = [label: string, go: () => void];

export type Screen = {
  blocks: Block[];
  choices?: Choice[];
  /** Show the code field; called with whatever was typed. */
  input?: (code: string) => void;
  /** Show "Let the channel forget me" in the footer. */
  forget?: () => void;
  /** This screen may, rarely, offer "Did you hear that?"; this is where it goes. */
  rare?: () => void;
  /** The world goes quiet while this screen is up: the sky dims and the meter
   *  sinks ("hush"), or the signal is gone altogether ("beyond"). Pauses on a
   *  quiet screen can't be tapped past: the silence is the point. */
  hush?: "hush" | "beyond";
};

/** A line of prose. `lead` types first, slowly, then gives way to the line (the first visit's "....."). */
export const p = (text: string, lead?: string): Block => ({ kind: "p", text, lead });
export const dim = (text: string): Block => ({ kind: "p", text, dim: true });
export const label = (text: string): Block => ({ kind: "label", text });
export const serif = (text: string): Block => ({ kind: "serif", text });
export const stars = (items: string[]): Block => ({ kind: "stars", items });
/** A line that isn't typed: it surfaces out of blur, half-heard. */
export const whisper = (text: string): Block => ({ kind: "whisper", text });
/** Nothing, for a while. */
export const pause = (ms: number): Block => ({ kind: "pause", ms });
export const card = (c: Card, opts: { faded?: boolean; resolve?: boolean } = {}): Block => ({
  kind: "card",
  card: c,
  ...opts,
});

/** The rare "Did you hear that?". `force` is set by #rare; screens.ts sets `go`. */
export const rare = { chance: 0.04, force: false, go: (_back: () => void) => {} };

const wrap = document.querySelector<HTMLElement>(".wrap")!;
const main = document.getElementById("screen")!;
const foot = document.getElementById("foot")!;
const motion = matchMedia("(prefers-reduced-motion: reduce)");

/** Characters per second while typing. Faster than anyone reads. */
const CPS = 90;
/** Per character of a `lead`, and the beat before the real line replaces it. */
const LEAD_MS = 300;
const LEAD_HOLD = 500;
/** Extra beats after punctuation, so sentences land. */
const PAUSE: Record<string, number> = { ".": 90, "?": 90, "!": 90, "…": 140, ":": 60, ",": 35 };

/**
 * One per screen. A newer screen makes the old one stale (`alive` goes
 * false and its pending work stops). A tap skips: every beat still to come
 * on this screen, typing and pauses alike, resolves at once.
 */
type Run = { alive: () => boolean; skipped: boolean; skip: () => void; onSkip: Promise<void> };

let current: Run;

function begin(): Run {
  let resolve!: () => void;
  const onSkip = new Promise<void>((r) => (resolve = r));
  const run: Run = {
    alive: () => current === run,
    skipped: false,
    skip: () => ((run.skipped = true), resolve()),
    onSkip,
  };
  current = run;
  if (motion.matches) run.skip();
  return run;
}

begin();

const wait = (run: Run, ms: number) =>
  run.skipped ? Promise.resolve() : Promise.race([new Promise<void>((r) => setTimeout(r, ms)), run.onSkip]);

/* ---------- skipping and keys ---------- */

main.addEventListener("pointerdown", (e) => {
  if (!(e.target as Element).closest("button, input, a")) current.skip();
});

document.addEventListener("keydown", (e) => {
  if ((e.target as Element).closest("input, button, a") || e.metaKey || e.ctrlKey || e.altKey) return;
  const buttons = main.querySelectorAll<HTMLButtonElement>(".choice");
  if ((e.key === " " || e.key === "Enter") && !buttons.length) {
    current.skip();
    e.preventDefault();
  } else if (/^[1-9]$/.test(e.key)) {
    buttons[Number(e.key) - 1]?.click(); // a small DOS courtesy
  }
});

/* ---------- screens ---------- */

/** Fade the old screen out; hand back a fresh run, or null if superseded. */
async function clear(): Promise<Run | null> {
  const run = begin();
  const hadFocus = main.contains(document.activeElement);
  if (main.querySelector(":scope > :not(noscript)") && !motion.matches) {
    wrap.classList.add("leaving");
    await new Promise((r) => setTimeout(r, 160));
  }
  if (!run.alive()) return null;
  main.replaceChildren();
  foot.replaceChildren();
  wrap.classList.remove("leaving");
  window.scrollTo({ top: 0 });
  if (hadFocus) main.focus({ preventScroll: true }); // keep keyboard users on the page
  return run;
}

export function show(s: Screen): void {
  void play(s);
}

async function play(s: Screen) {
  const run = await clear();
  if (!run) return;
  document.body.classList.toggle("hush", !!s.hush);
  document.body.classList.toggle("beyond", s.hush === "beyond");
  if (s.hush) meter.trigger(s.hush);
  else meter.release();

  for (const b of s.blocks) {
    if (b.kind === "pause") {
      await (s.hush ? new Promise((r) => setTimeout(r, b.ms)) : wait(run, b.ms));
      if (!run.alive()) return;
      continue;
    }
    const el = render(b);
    main.append(el);
    keepInView(el);
    if (b.kind === "p") await type(run, el, b.text, b.lead);
    else await wait(run, b.kind === "card" ? (b.resolve ? 650 : 280) : b.kind === "whisper" ? 2400 : 170);
    if (!run.alive()) return;
  }

  let list = s.choices ?? [];
  if (s.rare && (rare.force || Math.random() < rare.chance)) {
    rare.force = false;
    const back = s.rare;
    list = [...list, ["Did you hear that?", () => rare.go(back)]];
  }
  if (s.input) main.append(codeForm(s.input));
  if (list.length) main.append(choices(run, list));
  if (s.forget) foot.append(forgetButton(s.forget));
  keepInView(main.lastElementChild);
}

/**
 * The loading state, in-world. The bar fills over at least 1.4s, waits
 * (creeping) for `ready`, then completes and hands over. On a slow festival
 * connection it just reads as a weak signal. Not skippable.
 */
export function tune(text: string, ready: Promise<unknown>, then: () => void): void {
  void playTune(text, ready, then);
}

async function playTune(text: string, ready: Promise<unknown>, then: () => void) {
  const run = await clear();
  if (!run) return;
  document.body.classList.remove("hush", "beyond");
  meter.release();

  const bar = h("span");
  bar.setAttribute("aria-hidden", "true");
  const el = h("p", "tune");
  el.append(h("span", "", text), h("span", "sr-only", "…"), bar);
  main.append(el);

  let isReady = false;
  ready.finally(() => (isReady = true));
  const minMs = motion.matches ? 300 : 1400;
  const cells = 14;
  const start = performance.now();
  let last = start;
  let progress = 0;
  let drawn = -1;

  await new Promise<void>((done) => {
    const frame = (now: number) => {
      if (!run.alive()) return done();
      const t = now - start;
      const dt = now - last;
      last = now;
      if ((isReady && t >= minMs) || t > 9000) progress = Math.min(1, progress + dt / 220);
      else if (t < minMs) progress = 0.9 * (1 - (1 - t / minMs) ** 2);
      else progress = Math.min(0.97, progress + dt / 40000);
      const on = Math.round(progress * cells);
      if (on !== drawn) bar.textContent = "▰".repeat((drawn = on)) + "▱".repeat(cells - on);
      if (progress >= 1) return done();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  await new Promise((r) => setTimeout(r, 220));
  if (run.alive()) then();
}

/* ---------- typing ---------- */

async function type(run: Run, el: HTMLElement, text: string, lead?: string) {
  // The full line is laid out from the start (the unrevealed part is
  // invisible), so words never jump to the next line mid-type.
  const on = el.querySelector<HTMLElement>(".on")!;
  const off = el.querySelector<HTMLElement>(".off")!;
  let shown = 0;
  const reveal = (n: number) => {
    if (n === shown) return;
    shown = n;
    on.textContent = text.slice(0, n);
    off.textContent = text.slice(n);
  };
  if (run.skipped) return reveal(text.length);

  el.classList.add("typing");
  if (lead) {
    // Hold the line's space, tap out the lead, wait, then clear for the real words.
    on.textContent = "";
    for (let i = 1; i <= lead.length && !run.skipped; i++) {
      on.textContent = lead.slice(0, i);
      await wait(run, LEAD_MS);
    }
    await wait(run, LEAD_HOLD);
    on.textContent = "";
    if (run.skipped) return reveal(text.length), el.classList.remove("typing");
  }
  const typed = new Promise<void>((done) => {
    let budget = 0;
    let hold = 0;
    let last = performance.now();
    const frame = (now: number) => {
      if (!run.alive() || run.skipped) return done();
      const dt = Math.min(now - last, 50);
      last = now;
      if (hold > 0) hold -= dt;
      else {
        budget += (dt * CPS) / 1000;
        let n = shown;
        while (budget >= 1 && n < text.length) {
          budget -= 1;
          const ch = text[n++];
          if (text[n - 2] === " " || n === 1) (tick("type"), meter.nudge("type")); // each word lands: a tick, and a little signal
          if (PAUSE[ch] && text[n] === " ") {
            hold = PAUSE[ch];
            budget = 0;
            break;
          }
        }
        reveal(n);
      }
      if (shown >= text.length) return done();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  await Promise.race([typed, run.onSkip]);
  reveal(text.length);
  el.classList.remove("typing");
  await wait(run, 110);
}

/* ---------- rendering ---------- */

function render(b: Block): HTMLElement {
  switch (b.kind) {
    case "p": {
      const shown = h("span");
      shown.setAttribute("aria-hidden", "true");
      shown.append(h("span", "on"), h("span", "off", b.text));
      const el = h("p", b.dim ? "p dim" : "p");
      el.append(h("span", "sr-only", b.text), shown);
      return el;
    }
    case "label":
      return h("p", "label enter", b.text);
    case "serif":
      return h("p", "serif enter", b.text);
    case "whisper":
      return h("p", "whisper", b.text);
    case "pause":
      return h("span"); // never rendered: play() handles pauses before this
    case "stars": {
      const ul = h("ul", "stars enter");
      for (const item of b.items) ul.append(h("li", "", item));
      return ul;
    }
    case "card": {
      const c = b.card;
      const fig = h("figure", `post enter${b.faded ? " faded" : ""}${b.resolve ? " resolve" : ""}`);
      const cap = h("figcaption", "name");
      cap.append(h("b", "", c.name), h("span", "code", b.faded ? "unconfirmed" : c.code));
      fig.append(artPicture(c), cap, h("p", "desig", b.faded ? "a leaning, not a post" : c.designation));
      return fig;
    }
  }
}

function choices(run: Run, list: Choice[]) {
  const nav = h("nav", "choices");
  nav.setAttribute("aria-label", "Choices");
  list.forEach(([text, go], i) => {
    const btn = h("button", "choice", text) as HTMLButtonElement;
    btn.type = "button";
    btn.style.setProperty("--i", String(i));
    btn.addEventListener("click", () => {
      if (nav.classList.contains("chosen")) return;
      nav.classList.add("chosen");
      btn.classList.add("picked");
      tick("tap");
      meter.nudge("pick");
      // Let the pick register, unless something else (the mark) took over meanwhile.
      setTimeout(() => run.alive() && go(), motion.matches ? 0 : 150);
    });
    nav.append(btn);
  });
  return nav;
}

function codeForm(submit: (code: string) => void) {
  const form = h("form", "code enter") as HTMLFormElement;
  const input = h("input") as HTMLInputElement;
  Object.assign(input, { id: "code", name: "code", autocomplete: "off", spellcheck: false, maxLength: 5, placeholder: "__-__" });
  input.setAttribute("autocapitalize", "characters");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("enterkeyhint", "send");
  input.setAttribute("aria-label", "The code from the top corner of your card");
  // Shape it as they type: two letters, a dash, two numbers. Leave it alone
  // mid-composition, or some Android keyboards double the letters.
  input.addEventListener("input", (e) => {
    input.classList.remove("nudge");
    if ((e as InputEvent).isComposing) return;
    const raw = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const shaped = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2, 4)}` : raw;
    if (shaped !== input.value) input.value = shaped;
  });
  const send = h("button", "choice primary", "Transmit") as HTMLButtonElement;
  send.type = "submit";
  form.append(input, send);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) {
      input.classList.remove("nudge");
      void input.offsetWidth; // restart the animation
      input.classList.add("nudge");
      input.focus();
      return;
    }
    input.blur();
    submit(v);
  });
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
  return form;
}

function forgetButton(go: () => void) {
  const btn = h("button", "forget enter", "Let the channel forget me") as HTMLButtonElement;
  btn.type = "button";
  btn.addEventListener("click", go);
  return btn;
}

/** As a screen grows past the fold, ease it into view. */
function keepInView(el: Element | null) {
  if (!el) return;
  const over = el.getBoundingClientRect().bottom - (window.innerHeight - 24);
  if (over > 0) window.scrollBy({ top: over, behavior: motion.matches ? "auto" : "smooth" });
}

export function h(tag: string, className = "", text?: string) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
