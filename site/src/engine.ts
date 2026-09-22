// The screen engine. A screen is a few blocks of prose that type themselves
// out, then two to four choices. Everything else — transitions, the caret,
// skipping, the tuning bar — lives here so screens.ts can read like a script.

import { ART_SIZES, type Card } from "./deck";

export type Block =
  | { kind: "p"; text: string; dim?: boolean }
  | { kind: "label"; text: string }
  | { kind: "serif"; text: string }
  | { kind: "stars"; items: string[] }
  | { kind: "card"; card: Card; faded?: boolean; resolve?: boolean };

export type Choice = [label: string, go: () => void];

export type Screen = {
  blocks: Block[];
  choices?: Choice[];
  /** Show the code field; called with whatever was typed. */
  input?: (code: string) => void;
  /** Show "Let the channel forget me" in the footer. */
  forget?: () => void;
};

export const p = (text: string): Block => ({ kind: "p", text });
export const dim = (text: string): Block => ({ kind: "p", text, dim: true });
export const label = (text: string): Block => ({ kind: "label", text });
export const serif = (text: string): Block => ({ kind: "serif", text });
export const stars = (items: string[]): Block => ({ kind: "stars", items });
export const card = (c: Card, opts: { faded?: boolean; resolve?: boolean } = {}): Block => ({
  kind: "card",
  card: c,
  ...opts,
});

const main = document.getElementById("screen")!;
const foot = document.getElementById("foot")!;
const motion = matchMedia("(prefers-reduced-motion: reduce)");

/** Characters per second while typing. Faster than anyone reads. */
const CPS = 120;
/** Extra beats after punctuation, so sentences land. */
const PAUSE: Record<string, number> = { ".": 90, "?": 90, "!": 90, "…": 140, ":": 60, ",": 35 };

let run = 0; // bumps on every new screen; stale async work checks it and stops
let fast = false; // true once the reader taps to skip
let finishLine: (() => void) | null = null; // completes the line being typed

/** Skip ahead: the current line lands whole, the rest of the screen follows at once. */
function skip() {
  fast = true;
  finishLine?.();
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, fast ? 0 : ms));

/* ---------- skipping and keys ---------- */

main.addEventListener("pointerdown", (e) => {
  if (!(e.target as Element).closest("button, input, a")) skip();
});

document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
  const buttons = [...main.querySelectorAll<HTMLButtonElement>(".choice")];
  if (e.key === " " || e.key === "Enter") {
    if (!buttons.length) {
      skip();
      e.preventDefault();
    }
  } else if (/^[1-9]$/.test(e.key)) {
    buttons[Number(e.key) - 1]?.click(); // a small DOS courtesy
  }
});

/* ---------- screens ---------- */

async function clear(id: number) {
  fast = motion.matches;
  if (main.childElementCount && !motion.matches) {
    main.classList.add("leaving");
    foot.classList.add("leaving");
    await new Promise((r) => setTimeout(r, 160));
  }
  if (id !== run) return false;
  main.replaceChildren();
  foot.replaceChildren();
  main.classList.remove("leaving");
  foot.classList.remove("leaving");
  window.scrollTo({ top: 0 });
  return true;
}

export async function show(s: Screen) {
  const id = ++run;
  const alive = () => id === run;
  if (!(await clear(id))) return;

  for (const b of s.blocks) {
    const el = render(b);
    main.append(el);
    keepInView(el);
    if (b.kind === "p") await type(el, b.text, alive);
    else await wait(b.kind === "card" ? (b.resolve ? 650 : 280) : 170);
    if (!alive()) return;
  }

  if (s.input) main.append(codeForm(s.input));
  if (s.choices?.length) main.append(choices(s.choices));
  if (s.forget) foot.append(forgetButton(s.forget));
  keepInView(main.lastElementChild);
}

/**
 * The loading state, in-world. The bar fills over at least `minMs`, waits
 * (creeping) for `ready`, then completes and hands over. On a slow festival
 * connection it just reads as a weak signal.
 */
export async function tune(text: string, ready: Promise<unknown>, then: () => void) {
  const id = ++run;
  if (!(await clear(id))) return;

  const el = document.createElement("p");
  el.className = "tune";
  el.innerHTML = `<span class="sr-only"></span><span aria-hidden="true"></span>`;
  el.children[0].textContent = `${text}…`;
  const bar = el.children[1];
  main.append(el);

  let ready_ = false;
  ready.finally(() => (ready_ = true));
  const minMs = motion.matches ? 300 : 1400;
  const cells = 14;
  const start = performance.now();
  let last = start;
  let progress = 0;

  await new Promise<void>((done) => {
    const frame = (now: number) => {
      if (id !== run) return done();
      const t = now - start;
      const dt = now - last;
      last = now;
      if ((ready_ && t >= minMs) || t > 9000) progress = Math.min(1, progress + dt / 220);
      else if (t < minMs) progress = 0.9 * (1 - (1 - t / minMs) ** 2);
      else progress = Math.min(0.97, progress + dt / 40000);
      const on = Math.round(progress * cells);
      bar.textContent = `${text}\n${"▰".repeat(on)}${"▱".repeat(cells - on)}`;
      if (progress >= 1) return done();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  await new Promise((r) => setTimeout(r, 220));
  if (id === run) then();
}

/* ---------- typing ---------- */

async function type(el: HTMLElement, text: string, alive: () => boolean) {
  // The full line is laid out from the start (the unrevealed part is
  // invisible), so words never jump to the next line mid-type.
  const on = el.querySelector<HTMLElement>(".on")!;
  const off = el.querySelector<HTMLElement>(".off")!;
  const reveal = (n: number) => {
    on.textContent = text.slice(0, n);
    off.textContent = text.slice(n);
  };
  if (fast) return reveal(text.length);

  el.classList.add("typing");
  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      finishLine = null;
      resolve();
    };
    finishLine = () => (reveal(text.length), done());
    let shown = 0;
    let budget = 0;
    let hold = 0;
    let last = performance.now();
    const frame = (now: number) => {
      if (settled) return;
      if (!alive()) return done();
      if (fast) return reveal(text.length), done();
      const dt = Math.min(now - last, 50);
      last = now;
      if (hold > 0) hold -= dt;
      else {
        budget += (dt * CPS) / 1000;
        while (budget >= 1 && shown < text.length) {
          budget -= 1;
          const ch = text[shown++];
          if (PAUSE[ch] && text[shown] === " ") {
            hold = PAUSE[ch];
            budget = 0;
            break;
          }
        }
        reveal(shown);
      }
      if (shown >= text.length) return done();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  el.classList.remove("typing");
  await wait(110);
}

/* ---------- rendering ---------- */

function render(b: Block): HTMLElement {
  switch (b.kind) {
    case "p": {
      const el = h("p", b.dim ? "p dim" : "p");
      const full = h("span", "sr-only", b.text);
      const shown = h("span");
      shown.setAttribute("aria-hidden", "true");
      shown.append(h("span", "on"), h("span", "off", b.text));
      el.append(full, shown);
      return el;
    }
    case "label":
      return h("p", "label enter", b.text);
    case "serif":
      return h("p", "serif enter", b.text);
    case "stars": {
      const ul = h("ul", "stars enter");
      for (const item of b.items) ul.append(h("li", "", item));
      return ul;
    }
    case "card": {
      const c = b.card;
      const fig = h("figure", `post enter${b.faded ? " faded" : ""}${b.resolve ? " resolve" : ""}`);
      const pic = h("picture", "art");
      const avif = h("source");
      avif.setAttribute("type", "image/avif");
      avif.setAttribute("srcset", c.art.avif);
      avif.setAttribute("sizes", ART_SIZES);
      const webp = h("source");
      webp.setAttribute("type", "image/webp");
      webp.setAttribute("srcset", c.art.webp);
      webp.setAttribute("sizes", ART_SIZES);
      const img = h("img") as HTMLImageElement;
      Object.assign(img, { src: c.art.src, width: 880, height: 880, alt: `Card art for ${c.name}`, decoding: "async" });
      pic.append(avif, webp, img);
      const cap = h("figcaption", "name");
      cap.append(h("b", "", c.name), h("span", "code", b.faded ? "unconfirmed" : c.code));
      fig.append(pic, cap, h("p", "desig", b.faded ? "a leaning, not a post" : c.designation));
      return fig;
    }
  }
}

function choices(list: Choice[]) {
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
      navigator.vibrate?.(8);
      setTimeout(go, motion.matches ? 0 : 150);
    });
    nav.append(btn);
  });
  return nav;
}

function codeForm(submit: (code: string) => void) {
  const form = h("form", "code enter") as HTMLFormElement;
  const input = h("input") as HTMLInputElement;
  Object.assign(input, {
    id: "code",
    name: "code",
    autocomplete: "off",
    spellcheck: false,
    maxLength: 5,
    placeholder: "__-__",
  });
  input.setAttribute("autocapitalize", "characters");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("enterkeyhint", "send");
  input.setAttribute("aria-label", "The code from the top corner of your card");
  // Shape it as they type: two letters, a dash, two numbers.
  input.addEventListener("input", () => {
    const raw = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    input.value = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2, 4)}` : raw;
    input.classList.remove("nudge");
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

function h(tag: string, className = "", text?: string) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
