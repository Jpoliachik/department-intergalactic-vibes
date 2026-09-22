// Plays the patch. One animation loop: the dot updates every frame, the
// number redraws at the patch's cadence, anomalies start on schedule (only
// while someone's looking), and taps and presence come in through the API.
// Creative changes belong in patch.ts, not here.

import { tick } from "../haptics";
import { cadence, COLORS, EPISODES, PRESENCE, resting, SCHEDULE, type Episode, type EpisodeName, type Reading } from "./patch";
import type { Moment } from "./waves";

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const seconds = ([lo, hi]: readonly [number, number]) => lo + Math.random() * (hi - lo);

function createMeter() {
  let el: HTMLElement | undefined;
  let dotEl: HTMLElement;
  let valueEl: HTMLElement;
  let onFile: () => string | undefined = () => undefined;

  const opened = performance.now() / 1000;
  let last = opened;
  let presence = 0;
  let presenceAt = opened;
  let episode: { ep: Episode; start: number } | null = null;
  let anomalies = 0;
  let nextAt = opened + seconds(SCHEDULE.first);
  let textAt = 0;
  let shownText = "";
  let shownMood: Reading["mood"];

  const presenceNow = (now: number) => presence * 0.5 ** ((now - presenceAt) / PRESENCE.halfLife);

  function begin(name: EpisodeName, now = performance.now() / 1000) {
    episode = { ep: EPISODES[name](), start: now };
    textAt = 0; // redraw the number on the next frame
  }

  function frame() {
    requestAnimationFrame(frame); // paused by the browser while the tab is hidden
    if (!el) return;
    const now = performance.now() / 1000;
    const d = new Date();
    const m: Moment = {
      t: now - opened,
      dt: Math.min(now - last, 0.1),
      hour: d.getHours() + d.getMinutes() / 60,
      presence: presenceNow(now),
      post: onFile(),
      untilEpisode: episode ? Infinity : nextAt - now,
    };
    last = now;

    if (!episode && now >= nextAt) {
      begin(SCHEDULE.pick(anomalies++), now);
      nextAt = now + episode!.ep.seconds + seconds(SCHEDULE.gap);
    }

    const rest = resting(m);
    let r: Reading = rest;
    if (episode) {
      const k = (now - episode.start) / episode.ep.seconds;
      if (k < 1) r = { ...rest, mood: undefined, ...episode.ep.draw(k, rest, m) };
      else episode = null;
    }

    // The dot: every frame, unless motion is reduced.
    const color = COLORS[r.dot];
    if (motion.matches) {
      dotEl.style.opacity = r.mood === "lost" ? "0.1" : "1";
    } else {
      dotEl.style.opacity = r.glow.toFixed(3);
      dotEl.style.transform = `scale(${r.size.toFixed(3)})`;
    }
    if (dotEl.style.color !== color) dotEl.style.color = color;

    // The number: at its own cadence.
    if (performance.now() >= textAt) {
      textAt = performance.now() + cadence(m, !!episode);
      const text = r.hz === null ? "—.— Hz" : `${r.hz.toFixed(2)} Hz`;
      if (text !== shownText) valueEl.textContent = shownText = text;
    }
    if (r.mood !== shownMood) {
      for (const mood of ["hot", "lost", "bright"] as const) el.classList.toggle(mood, r.mood === mood);
      el.closest("header")?.classList.toggle("spiking", r.mood === "hot");
      shownMood = r.mood;
    }
  }

  const api = {
    /** Start reading into `into`. `post` says which post is on file, if any. */
    start(into: HTMLElement, opts: { post?: () => string | undefined } = {}) {
      el = into;
      if (opts.post) onFile = opts.post;
      dotEl = Object.assign(document.createElement("span"), { className: "dot", textContent: "●" });
      valueEl = Object.assign(document.createElement("span"), { className: "value", textContent: (shownText = "7.83 Hz") });
      el.replaceChildren(dotEl, valueEl);
      // Tapping the meter checks it: a haptic tick and a small bright swell.
      el.addEventListener("pointerdown", () => {
        api.nudge("tap");
        tick("tap");
        if (!episode) begin("calibrate");
      });
      requestAnimationFrame(frame);
    },
    /** Presence: a word typed, a choice picked, a tap. It fades on its own. */
    nudge(kind: "type" | "pick" | "tap") {
      const now = performance.now() / 1000;
      presence = Math.min(1, presenceNow(now) + PRESENCE[kind]);
      presenceAt = now;
    },
    /** Run an anomaly now, by name (the #spike, #dropout and #calibrate hooks). */
    trigger(name: string) {
      if (!(name in EPISODES)) return false;
      begin(name as EpisodeName);
      return true;
    },
  };
  return api;
}

export const meter = createMeter();
