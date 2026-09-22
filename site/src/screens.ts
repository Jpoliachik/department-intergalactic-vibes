// Every screen on the channel, in the order a visitor might meet them.
// Three ways in (a card, a reading, just listening), each ending somewhere
// the device remembers. Copy here is the site's voice: see CLAUDE.md.

import { CALIBRATION, POSTS, RARE, READINGS, RETURNS, TUNING } from "./content";
import { byCode, bySlug, preloadArt, shortName, type Card } from "./deck";
import { card, dim, label, p, rare, serif, show, stars, tune, type Block, type Choice } from "./engine";
import { load, update, wipe } from "./state";

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** Stable string hash, for readings that should repeat rather than roll. */
function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Fonts the deeper screens use but the first one doesn't. The tuning bar
 *  waits for them with the art, so nothing re-lays out mid-type. */
const fontsReady = () =>
  Promise.all(["500 1em 'Plex Mono'", "italic 400 1em 'Plex Mono'", "italic 500 1em Cormorant"].map((f) => document.fonts.load(f))).catch(
    () => {},
  );

/** Where "home" is for this device: their post, their reading, or nowhere yet. */
function home(): Choice | undefined {
  const m = load();
  if (m.card) return ["Back to your post", () => go.post()];
  if (m.leaning) return ["Back to your reading", () => go.leaning()];
}
const homeChoices = (): Choice[] => {
  const h = home();
  return h ? [h] : [];
};
/** The way out of a lore room: home if there is one, otherwise an offer. */
const loreExit = (): Choice => home() ?? ["Could it read me?", () => go.offer()];

/** A screen about the visitor's own post; without one on file, start over. */
const withPost =
  (screen: (c: Card) => void) =>
  (): void => {
    const c = bySlug(load().card);
    return c ? screen(c) : go.start();
  };

const handedACard: Choice = ["I've since been handed a card", () => go.askCode()];
const mayHandYou = [p("Keep listening."), p("Someone may hand you something.")];

export const go = {
  start(): void {
    const m = load();
    const c = bySlug(m.card);
    if (c) {
      const [a, b] = pick(RETURNS)(shortName(c), c.name);
      return go.post({ intro: [p(a), dim(b)] });
    }
    if (m.leaning) return go.leaning();
    show({
      blocks: [
        // A first visit waits on the signal before it resolves.
        m.listened ? p("Signal detected.") : p("Signal detected.", "....."),
        p(m.listened ? "Familiar, this time. You've listened here before." : "Faint, but it's there. Something about you registered on the Grid."),
        p("How did you find us?"),
      ],
      choices: [
        ["Someone handed me a card", go.askCode],
        ["Someone took my reading", go.inspected],
        ["I'm not sure", go.listen],
      ],
      rare: go.start,
    });
  },

  /* ---------- the card path ---------- */

  askCode(): void {
    show({
      blocks: [p("Your card carries a code in its top corner."), p("Read it to us.")],
      input: go.transmit,
      choices: [["Never mind", go.start]],
    });
  },

  transmit(raw: string): void {
    const c = byCode(raw);
    if (!c)
      return show({
        blocks: [p("That designation isn't on any register we hold."), dim("Check the corner of the card. Two letters, two numbers.")],
        choices: [
          ["Read it again", go.askCode],
          ["Never mind", go.start],
        ],
      });
    tune(pick(TUNING), Promise.all([preloadArt(c), fontsReady()]), () => {
      const before = load();
      update((m) => {
        m.card = c.slug;
        delete m.leaning;
      });
      if (before.card === c.slug) return go.start();
      const leaned = bySlug(before.leaning);
      const intro = !leaned
        ? [p("There you are."), p("We have you on file.")]
        : leaned === c
          ? [p(`It was always ${c.name}.`), dim("The draw agrees with the reading. That doesn't happen as often as you'd think.")]
          : [p("The Grid had its own reading."), dim(`You leaned toward ${leaned.name}. The draw says otherwise.`)];
      go.post({ intro, arriving: true });
    });
  },

  /** The post hub. `arriving` is the first sight of it: the art resolves, and nothing rare interrupts. */
  post({ intro = [], arriving = false }: { intro?: Block[]; arriving?: boolean } = {}): void {
    withPost((c) =>
      show({
        blocks: [...intro, card(c, { resolve: arriving }), serif(c.tagline)],
        choices: [
          ["Your assignments", go.assignments],
          ["Today's reading", go.today],
          ["Read the card closer", go.closer],
          ["Who's on the other end?", go.listen],
        ],
        forget: () => go.forget(() => go.post()),
        rare: arriving ? undefined : () => go.post(),
      }),
    )();
  },

  assignments: withPost((c) =>
    show({
      blocks: [p(c.bio), dim("Your assignments:"), stars(c.assignments), dim("No end date. They're yours for as long as you carry the card.")],
      choices: homeChoices(),
    }),
  ),

  today: withPost((c) => {
    const now = new Date();
    const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const reading = READINGS[hash(day + c.slug) % READINGS.length];
    const when = now.toLocaleDateString(undefined, { day: "numeric", month: "long" });
    tune("Reading", Promise.resolve(), () =>
      show({
        blocks: [dim(`${c.name} · ${when}`), serif(reading), dim("Come back tomorrow. It won't say the same thing.")],
        choices: homeChoices(),
      }),
    );
  }),

  closer: withPost((c) => {
    const lore = POSTS[c.slug];
    show({
      blocks: [
        dim(`${c.code} · ${c.function}`),
        label("In the field"),
        p(lore.field),
        label("On the Grid"),
        p(lore.grid),
        label("When it gets heavy"),
        p(lore.heavy),
        dim(`Often found near ${lore.near}.`),
      ],
      choices: [["Where does it come from?", go.root], ...homeChoices()],
    });
  }),

  root: withPost((c) =>
    show({
      blocks: [
        dim("Every post is older than Vibe Corp. Listeners were hearing this one long before anyone gave it a code."),
        ...POSTS[c.slug].root.map((t) => p(t)),
        dim("The card doesn't say any of this. It points."),
      ],
      choices: homeChoices(),
    }),
  ),

  /* ---------- the listening path ---------- */

  listen(): void {
    const m = load();
    if (m.card || m.leaning)
      return show({
        blocks: [p("Hard to say. The line runs a long way back."), p("Some of it you can hear from here.")],
        choices: [[m.card ? "Who sent the card?" : "Who took the reading?", go.whatVC], ["What is this channel?", go.whatChannel], ...homeChoices()],
      });
    show({
      blocks: [p("Then listen. There's no wrong place to start.")],
      choices: [
        ["What is Vibe Corp?", go.whatVC],
        ["What is this channel?", go.whatChannel],
      ],
    });
  },

  whatVC(): void {
    show({
      blocks: [
        p("Vibe Corp keeps the galaxy's vibrations in tune."),
        p("Crew in purple hi-vis, tending the Resonance Grid. Taking readings, patching what's leaking, looking into anything strange."),
        dim("As for what kind of thing it is: a company, a guild, a lineage. Depends who you ask. Nobody asks much."),
      ],
      choices: [
        ["What's the Grid?", go.grid],
        ["How old is it?", go.vcOld],
        ["Why are they here?", go.vcEarth],
      ],
    });
  },

  vcOld(): void {
    show({
      blocks: [
        p("Older than the records, and the records go back a long way."),
        p("It started as listening. Someone heard the hum and told a friend. The friend told a friend. It accreted from there."),
        dim("The name's worn in. Nobody remembers choosing it."),
      ],
      choices: [
        ["Who runs it now?", go.hq],
        ["What's the Grid?", go.grid],
      ],
    });
  },

  vcEarth(): void {
    show({
      blocks: [
        p("Earth is a small spot on the Grid. It reads unusually loud."),
        p("Especially when people gather for music and dancing. Festivals are spikes. You can see them from a long way off."),
        dim("Earth postings are the most requested there are. The crew love it here."),
      ],
      choices: [["Who are the crew?", go.crew], loreExit()],
    });
  },

  whatChannel(): void {
    show({
      blocks: [p("A place the Grid can be heard, if you're quiet enough."), p("Crew check in here. So do people the crew have met. Some people just find it.")],
      choices: [
        ["What is Vibe Corp?", go.whatVC],
        ["What's the Grid?", go.grid],
      ],
    });
  },

  grid(): void {
    show({
      blocks: [p("Everything is connected. Stars, songs, strangers across a fire."), p("The connection is the Grid. The signal running through it is what we call resonance.")],
      choices: [
        ["What feeds it?", go.feeds],
        ["Who tends it?", go.crew],
      ],
    });
  },

  feeds(): void {
    show({
      blocks: [p("Connection. Dancing. Laughing at the same thing at the same moment."), p("A single quiet conversation between strangers will register, on a sensitive enough meter.")],
      choices: [["Who's measuring?", go.crew], loreExit()],
    });
  },

  crew(): void {
    show({
      blocks: [
        p("A crew in purple hi-vis. They take readings, patch what's leaking, look into anything strange."),
        p("Most of the time you'd walk right past them. Some of the time they walk up to you."),
      ],
      choices: [["Who sends them?", go.hq], loreExit()],
    });
  },

  hq(): void {
    show({
      blocks: [p("There's a home office. It's old. Nobody's quite sure what it is."), p("The badges come from somewhere. That much holds up.")],
      choices: [["Is anyone there?", go.wind], loreExit()],
    });
  },

  wind(): void {
    show({
      blocks: [dim("The channel carries wind for a while."), dim("…"), dim("Then more wind.")],
      choices: [["Keep listening", go.quiet]],
    });
  },

  offer(): void {
    show({
      blocks: [p("There's a reading we can take, if you'll hold still."), p("It won't tell you everything. It'll tell you where you lean.")],
      choices: [
        ["Take the reading", go.calibrate],
        ["Not yet", go.quiet],
      ],
    });
  },

  quiet(): void {
    const m = load();
    if (m.card) return show({ blocks: [p("Keep listening."), dim("You already carry something. The channel will be here.")], choices: homeChoices() });
    if (m.leaning) return show({ blocks: mayHandYou, choices: [...homeChoices(), handedACard] });
    update((m) => (m.listened = true));
    show({
      blocks: mayHandYou,
      choices: [
        ["Take a reading after all", go.calibrate],
        ["I was handed a card", go.askCode],
      ],
      forget: () => go.forget(go.quiet),
      rare: go.quiet,
    });
  },

  /* ---------- the reading path ---------- */

  inspected(): void {
    show({
      blocks: [
        p("An inspection leaves a trace. Whoever took your reading saw something worth marking."),
        p("Let's see what else it picked up. Three questions. First thing that comes to you."),
      ],
      choices: [["Begin", go.calibrate]],
    });
  },

  calibrate(): void {
    const given: [string, string[]][] = [];
    const ask = (i: number): void => {
      if (i === CALIBRATION.length) return finish();
      const q = CALIBRATION[i];
      show({
        blocks: [dim(`Calibration ${i + 1} of ${CALIBRATION.length}`), ...q.ask.map((t) => p(t))],
        choices: q.answers.map((a): Choice => [a[0], () => (given.push(a), ask(i + 1))]),
      });
    };
    const finish = () => {
      const score: Record<string, number> = {};
      for (const [, posts] of given) for (const s of posts) score[s] = (score[s] ?? 0) + 1;
      const top = Math.max(...Object.values(score));
      const tied = Object.keys(score)
        .filter((s) => score[s] === top)
        .sort();
      const slug = tied[hash(given.map((g) => g[0]).join("|")) % tied.length];
      tune("Calibrating", Promise.all([preloadArt(bySlug(slug)!), fontsReady()]), () => {
        update((m) => (m.leaning = slug));
        go.leaning({ arriving: true });
      });
    };
    ask(0);
  },

  /** The reading's result. `arriving` is the moment it's first read out. */
  leaning({ arriving = false } = {}): void {
    const c = bySlug(load().leaning);
    if (!c) return go.start();
    show({
      blocks: [
        ...(arriving ? [p("Your signal leans toward…")] : [p("Your reading stands."), dim("It hasn't moved. Readings don't, much.")]),
        card(c, { faded: true }),
        serif(c.tagline),
        dim("Carry these for now:"),
        stars(c.assignments),
        dim("The Grid confirms a post in person. Someone in purple carries the deck."),
      ],
      choices: [["Who's on the other end?", go.listen], handedACard],
      forget: () => go.forget(() => go.leaning()),
      rare: arriving ? undefined : () => go.leaning(),
    });
  },

  /* ---------- forgetting ---------- */

  forget(back: () => void): void {
    show({
      blocks: [p("The Grid keeps everything."), p("This device won't."), p("Clear the channel?")],
      choices: [
        [
          "Clear it",
          () => {
            wipe();
            show({ blocks: [dim("Cleared."), p("The channel doesn't know you. It's still open.")], choices: [["Tune in again", go.start]] });
          },
        ],
        ["Stay on file", back],
      ],
    });
  },
};

rare.go = (back) => show({ blocks: [dim("…"), p(pick(RARE))], choices: [["Keep listening", back]] });
