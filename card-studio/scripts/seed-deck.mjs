// Seed deck/globals.json and deck/<slug>/card.json.
// Write-if-missing by default (safe to re-run); set FORCE=1 to overwrite.
//
//   node scripts/seed-deck.mjs
//   FORCE=1 node scripts/seed-deck.mjs
//
// Images (deck/<slug>/image.png) are never touched here.

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECK_DIR = path.join(__dirname, "..", "deck");
const FORCE = process.env.FORCE === "1";

const IMAGE_TEMPLATE = `Mid-century screenprint poster illustration crossed with 1960s psychedelic cosmic art. Bold flat shapes, heavy riso halftone grain, deliberate ink misregistration, high contrast. Mostly deep-indigo darkness with generous negative space. Strictly limited palette: deep cosmic indigo, Vibe Corp purple, warm amber glow, star-white — and no other colors.

Render exactly this moment as a single, decisive image:
{{sceneStory}}

The figure is {{name}} — {{bio}} They are the clear focal subject, and the glowing element is the single brightest point in the frame.

One figure, one symbol, one place. No text, no lettering, no border, no card frame — illustration only.`;

const TAGLINE_TEMPLATE = `You are the copy desk of Vibe Corp, a fictional but sincere cosmic outfit that tends the Resonance Grid. Tone: warm, technical-but-mystical, sincere — never winking, never ironic.

Write ONE short tagline for this field-specialty character.
Rules:
- At most 6 words.
- Punchy and profound, a little mystical, always optimistic — reads like eternal wisdom.
- No quotation marks, no trailing period, no emoji.

Character: {{name}} ({{designation}})
Who they are: {{bio}}
The scene on their card: {{sceneStory}}
Their assignment: {{assignment}}

Return only the tagline text, nothing else.`;

const ASSIGNMENT_TEMPLATE = `You are the copy desk of Vibe Corp, a fictional but sincere cosmic outfit that tends the Resonance Grid. Tone: warm, technical-but-mystical, sincere — never winking.

Write the "Your Assignment" line handed to a festival-goer who draws this card.
Rules:
- Exactly two short sentences.
- Sentence one: a concrete, do-able instruction for the weekend.
- Sentence two: one turn of eternal, optimistic wisdom.
- Glanceable, profound, plain language. No quotation marks, no emoji.

Character: {{name}} ({{designation}})
Who they are: {{bio}}
The scene on their card: {{sceneStory}}

Return only the two-sentence assignment, nothing else.`;

const GLOBALS = {
  imagePrompt: IMAGE_TEMPLATE,
  taglinePrompt: TAGLINE_TEMPLATE,
  assignmentPrompt: ASSIGNMENT_TEMPLATE,
  textModel: "claude-opus-5",
  imageModel: "gemini-2.5-flash-image",
};

const CARDS = [
  {
    slug: "the-fool",
    order: 0,
    name: "The Fool",
    designation: "Open Channel",
    code: "00",
    function: "Beginner's Mind",
    object: "Empty cup",
    fieldReading: "An empty cup holds the most.",
    bio: "The newest soul on the Grid, and the clearest channel because of it — arriving empty-handed, unburdened by what's supposed to be impossible. Beginner's mind made flesh.",
    sceneStory:
      "At the crumbling edge of a floating clifftop, a figure takes one step out into open air, an empty cup lifted overhead. From a rip in the sky above, a waterfall of stars pours straight down into the cup, filling it as they fall.",
    assignment: "Say yes before you find the reason not to. You won't be new for long.",
  },
  {
    slug: "the-anchor",
    order: 1,
    name: "The Anchor",
    designation: "Grounding Technician",
    code: "GT-01",
    function: "Stabilization",
    object: "Anchor",
    fieldReading: "Hold your ground, and others are free to lose theirs.",
    bio: "The steady weight the night orbits — calm, unhurried, fully present. Where they stand, other people find their feet.",
    sceneStory:
      "A wide river of liquid light pours across the frame, sweeping loose stars and tumbling figures along in its current. Braced dead-center against the flow, a figure grips a taut chain running down to a massive iron anchor buried in the glowing riverbed, the rushing light splitting into two smooth curves around their planted boots.",
    assignment:
      "Be the still point the night turns around. People let go only where someone else is holding on.",
  },
  {
    slug: "the-spark",
    order: 2,
    name: "The Spark",
    designation: "Ignition Specialist",
    code: "IS-02",
    function: "Initiation",
    object: "Lit match",
    fieldReading: "Go before you're ready. Readiness follows.",
    bio: "The one who moves first — a small, brave ignition in the dark. Nothing happens until they begin.",
    sceneStory:
      "At the center of an enormous empty stage, its far edges lost in black, a lean figure crouches on one knee and drags a match down a plank, throwing a small fan of sparks. From the lit match-head a thin stem of fire climbs and branches overhead into a glowing tree of flame, its light pushing the dark back to reveal rows of empty seats.",
    assignment:
      "Be the first one moving, before it feels reasonable. The moment was only ever waiting for you.",
  },
  {
    slug: "the-connector",
    order: 3,
    name: "The Connector",
    designation: "Linkage Officer",
    code: "LS-03",
    function: "Linkage",
    object: "Splice",
    fieldReading: "Every stranger is a line waiting to be drawn.",
    bio: "A closer of gaps, forever splicing new lines between strangers who were always meant to meet.",
    sceneStory:
      "On a dark plain between two far hills, each crowned by a single lonely star, a figure holds a glowing thread pulled down from each one. They twist the two ends together and the join flares white, a taut line of light snapping into place between the two stars.",
    assignment:
      "Introduce the two who were always going to find each other. You're simply the moment it happens.",
  },
  {
    slug: "the-beacon",
    order: 4,
    name: "The Beacon",
    designation: "Signal Lamp Operator",
    code: "SL-04",
    function: "Radiance",
    object: "Lantern",
    fieldReading: "Don't chase the signal. Become it.",
    bio: "A fixed point of warm light in the dark — one who doesn't chase the crowd but becomes the place it gathers.",
    sceneStory:
      "On a spit of black rock ringed by churning, silver-capped waves, a keeper in a heavy coat raises a lantern high over their head with both hands, its amber beam cutting a wide bright road across the dark water. Far out along that road, a small three-masted ship with torn sails swings its bow around to follow the light in.",
    assignment:
      "Don't chase the crowd — pick your spot and glow. What's meant for you comes to you.",
  },
  {
    slug: "the-tuner",
    order: 5,
    name: "The Tuner",
    designation: "Resonance Listener",
    code: "RL-05",
    function: "Reception",
    object: "Tuning fork",
    fieldReading: "Listen all the way to one, and you've heard the night.",
    bio: "A deep listener who gives one soul their whole frequency, and hears the quiet signal everyone else danced past.",
    sceneStory:
      "On the black shore of a perfectly still lake, a figure strikes a great tuning fork and lowers it toward the water. Out on the mirrored surface a single reflected star begins to ring and brighten, answering the note.",
    assignment:
      "Give one person your whole signal. The universe says its deepest things quietly.",
  },
  {
    slug: "the-caretaker",
    order: 6,
    name: "The Caretaker",
    designation: "Field Medic",
    code: "FM-06",
    function: "Maintenance",
    object: "Water bottle",
    fieldReading: "Look after the people, and the night looks after itself.",
    bio: "The tender of dimming lights — the one who reaches the fading before they think to ask.",
    sceneStory:
      "In a wide dark meadow where dozens of fallen stars lie half-buried and barely glowing in the grass, a figure kneels and lifts one cold, flickering star into cupped hands. They bend close and breathe on it until it flares awake in their palms — bright enough now to show three more dim ones waiting nearby.",
    assignment:
      "Reach the person fading before they ask. No light stays lit alone.",
  },
  {
    slug: "the-wanderer",
    order: 7,
    name: "The Wanderer",
    designation: "Field Pathfinder",
    code: "FP-07",
    function: "Survey",
    object: "Compass",
    fieldReading: "Follow the pull, not the program.",
    bio: "A roamer who trusts their feet over the map, drawn always to the pull off the edge of the program.",
    sceneStory:
      "Crossing a desert of violet dunes under a huge low moon, a figure holds a glowing compass flat in one palm and follows its needle. The needle points off the marked path toward a single pulsing light on the far horizon, and their footprints trail behind them across the sand.",
    assignment:
      "Trust your feet over the map. You always arrive where you're needed.",
  },
  {
    slug: "the-jester",
    order: 8,
    name: "The Jester",
    designation: "Buoyancy Technician",
    code: "BT-08",
    function: "Buoyancy",
    object: "Balloon",
    fieldReading: "Laughter keeps the night afloat.",
    bio: "Keeper of lightness — the one who breaks the tension and keeps the whole night afloat on laughter.",
    sceneStory:
      "Letting go of the ground, a harlequin floats up out of a deep, dark canyon, pulled skyward by a single glowing balloon. They tumble head-over-heels into a field of stars, laughter streaming behind them like the tail of a comet.",
    assignment:
      "Take the work seriously and nothing else. Anything heavy is one laugh from lifting.",
  },
  {
    slug: "the-pulse",
    order: 9,
    name: "The Pulse",
    designation: "Tempo Regulation Officer",
    code: "TR-09",
    function: "Cadence",
    object: "Metronome",
    fieldReading: "Find the beat beneath the beat.",
    bio: "Holder of the rhythm beneath the rhythm — the steady beat a long night organizes itself around.",
    sceneStory:
      "Sitting cross-legged at the exact center of a vast, glass-still black lake, a figure brings one hand down on a drum. A single ring of light springs from the strike and races outward across the whole mirrored surface toward the horizon.",
    assignment:
      "Find the rhythm under all the noise and hold it. The whole night falls into step.",
  },
  {
    slug: "the-oracle",
    order: 10,
    name: "The Oracle",
    designation: "Divination Officer",
    code: "DV-10",
    function: "Divination",
    object: "Crystal ball",
    fieldReading: "Read the air, not the clock.",
    bio: "A reader of what's coming before it arrives — part meteorologist, part mystic, wholly trusting the thing they can't explain.",
    sceneStory:
      "On a bare hilltop under a clear and perfectly calm night sky, a hooded figure bends over a crystal ball cupped in both hands. Inside the glass a violent storm is already breaking — lightning, black cloud — none of which has reached the still night around them yet.",
    assignment:
      "Trust the hunch before it makes sense. Knowing always arrives before the proof.",
  },
  {
    slug: "the-keeper-of-base",
    order: 11,
    name: "The Keeper of Base",
    designation: "Quartermaster",
    code: "QM-11",
    function: "Provision",
    object: "Kettle",
    fieldReading: "Keep the kettle on. They all come back.",
    bio: "Keeper of the hearth — the warm center every orbit returns to, with something good always waiting.",
    sceneStory:
      "In the middle of an endless dark plain, a figure crouches over a small campfire and lifts the lid of a steaming kettle. Theirs is the only spot of warmth for miles, and a single lit path winds out of the darkness straight to the fire.",
    assignment:
      "Be the place everyone drifts back to. Everything that wanders comes home.",
  },
  {
    slug: "the-witness",
    order: 12,
    name: "The Witness",
    designation: "Field Recorder",
    code: "OC-12",
    function: "Record",
    object: "Film camera",
    fieldReading: "What you carry home is the only copy.",
    bio: "The one who remembers the night so everyone else can vanish into it — keeper of the only copy.",
    sceneStory:
      "At the rim of a canyon overlooking a valley flooded with glowing light, a figure cranks the handle of an old film camera. The whole scene below lifts and spools up into the lens as a long ribbon of light, wound frame by frame onto the reel.",
    assignment:
      "Don't just live the night — keep it. What's remembered never really ends.",
  },
  {
    slug: "the-sentinel",
    order: 13,
    name: "The Sentinel",
    designation: "Night Watch Officer",
    code: "NW-13",
    function: "Vigil",
    object: "Hourglass",
    fieldReading: "The dark doesn't last. You do.",
    bio: "The one who holds the watch to dawn, awake to see the dark turn while the last circle sleeps.",
    sceneStory:
      "Alone on a high ridge, a figure holds up an hourglass in which grains of starlight are falling, and faces east. Along the black horizon a thin line has just cracked open into the first blue of dawn.",
    assignment:
      "Stay awake when the others have gone. The dawn belongs to whoever waited for it.",
  },
  {
    slug: "the-enchanter",
    order: 14,
    name: "The Enchanter",
    designation: "Glamour Technician",
    code: "GL-14",
    function: "Glamour",
    object: "Fairy lights",
    fieldReading: "Beauty is a frequency. Broadcast it.",
    bio: "A weaver of beauty who turns bare ground enchanted — to whom beauty is not decoration but the work itself.",
    sceneStory:
      "Crossing a cracked grey wasteland, a figure trails a long string of fairy lights from one hand. In the line behind every footstep, glowing flowers are bursting up out of the dead ground and opening.",
    assignment:
      "Make one plain corner beautiful. People become the magic a place promises them.",
  },
  {
    slug: "the-mentor",
    order: 15,
    name: "The Mentor",
    designation: "Induction Officer",
    code: "IN-15",
    function: "Induction",
    object: "Key",
    fieldReading: "Hold the door open behind you.",
    bio: "The one who holds the door open behind them — welcoming the hesitant in as if they'd always belonged.",
    sceneStory:
      "In the middle of an empty dark field stands a single freestanding door, warm light pouring out around its edges. Beside it a figure hung with a hundred keys holds one out to a hesitant newcomer just stepping in from the dark.",
    assignment:
      "See the one still outside the light, and wave them in. Someone once did it for you.",
  },
];

async function writeIfMissing(file, data) {
  try {
    await fs.access(file);
    if (!FORCE) {
      console.log(`skip  ${path.relative(DECK_DIR, file)} (exists)`);
      return;
    }
  } catch {
    // does not exist — fall through and write
  }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`write ${path.relative(DECK_DIR, file)}`);
}

async function main() {
  await fs.mkdir(DECK_DIR, { recursive: true });
  await writeIfMissing(path.join(DECK_DIR, "globals.json"), GLOBALS);
  for (const card of CARDS) {
    const full = { ...card, tagline: "", imagePrompt: "" };
    await writeIfMissing(path.join(DECK_DIR, card.slug, "card.json"), full);
  }
  console.log(`\nDone. ${CARDS.length} cards.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
