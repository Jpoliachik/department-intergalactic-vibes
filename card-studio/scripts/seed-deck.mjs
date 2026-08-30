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

const IMAGE_TEMPLATE = `70s cosmic revival — LARGE flat vector shapes, thick black outlines, vibrant retro palette of mustard, teal, blue, rose, brick red, black cosmic backdrop. Rainbow space vibes. retro-psychedelic meets modern flat illustration, with a mystical/occult flavor to it.

Render exactly this moment as a single, decisive image:
{{sceneStory}}

The figure is {{name}} — {{bio}} They are the clear focal subject. 

The image is carried by what the figure is DOING and by the world around them — not by an object. Do not build the frame around a held prop, and do not present a glowing item to camera as the hero of the shot. Anything in their hands stays small, incidental and unremarkable. The action, the light and the place tell it.

Fill the entire square frame edge to edge — full bleed. No border, no frame, no outer keyline, no matte, no white margin, no rounded corners, no card frame, no vignette of empty background. No text, no lettering, no title, no caption, no signature, no watermark. No card borders. Just illustration.`;

const TAGLINE_TEMPLATE = `You are writing in the voice of a single Vibe Corp character — speaking as them, not describing them. Vibe Corp is a fictional but sincere cosmic outfit that tends the Resonance Grid. Tone: warm, technical-but-mystical, sincere — never winking, never ironic.

Write ONE short line this character would actually say out loud. Their own words: the thing they'd tell you if you asked them how they work, or what they've figured out. A motto in their mouth, not a caption written about them.

Rules:
- At most 6 words.
- Spoken, not captioned. First person, or said straight to the listener. Contractions welcome.
- It must sound like THIS character and no other — their particular temperament, nerve and way of seeing. Someone reading it should be able to guess which card it came from.
- Punchy and profound, a little mystical, always optimistic. Earned, not fortune-cookie.
- Do not name the character, their designation, or any object.
- No quotation marks (the card adds them), no trailing period, no emoji.

Character: {{name}} ({{designation}})
Who they are: {{bio}}
The scene on their card: {{sceneStory}}
Their assignment: {{assignment}}

Return only the line, nothing else.`;

const ASSIGNMENT_TEMPLATE = `You are the copy desk of Vibe Corp, a fictional but sincere cosmic outfit that tends the Resonance Grid. Tone: warm, technical-but-mystical, sincere — never winking.

Write the passage of wisdom printed under the tagline on this card. It is the still centre of the card — what the person carries away, set in a serif like an inscription.

Rules:
- EXACTLY 2 lines, one per line of output. Not three. No numbering, no bullets, no blank lines between them.
- The two lines form ONE passage: the first opens it, the second turns and lands it. Not two separate aphorisms, and not the same thought said twice.
- HARD LIMIT: at most 42 characters per line, including spaces. Count them before you answer. Each line is set on its own printed line; anything longer is cut off.
- Spiritual guidance, not a to-do list. It tells someone how to BE, and why that holds — the way a tarot card speaks. Never a task, an errand, or anything that could be ticked off.
- BANNED: any time, place, count or festival logistic — no "tonight", "this weekend", "for three songs", "the dancefloor". Nothing scheduled, nothing countable, nothing you could finish.
- Plain, weighted language. Short words. It should read as though it has been true for a long time.
- No quotation marks, no emoji, no title, no label.

Character: {{name}} ({{designation}})
Who they are: {{bio}}
The scene on their card: {{sceneStory}}

Return only the lines, nothing else.`;

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
    bio: "The wide-eyed first-timer. Says yes before they know what to, and asks the obvious question everyone else was too proud to.",
    sceneStory:
      "At the crumbling edge of a floating clifftop, a figure steps out into open air with both arms flung wide and their head tipped back. From a rip in the sky above, a waterfall of stars pours straight down over them, catching them mid-stride.",
    assignments: [
      "Say yes before you find the reason not to.",
      "You won't be new for long.",
    ],
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
    bio: "The steady friend everyone drifts back to. Keeps their feet when the night tilts, and holds the spot where others can lose theirs.",
    sceneStory:
      "A wide river of liquid light pours across the frame, sweeping loose stars and tumbling figures along in its current. Braced dead-center against the flow with boots planted and knees bent, a figure holds their ground while the rushing light splits into two smooth curves around them.",
    assignments: [
      "Be the still point the night turns around.",
      "People let go only where someone else is holding on.",
    ],
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
    bio: "The one who always goes first. Moves before the fear catches up, and the moment they do, everyone else finds they were ready too.",
    sceneStory:
      "A figure steps out onto a bridge of dark, unlit stones suspended over a black gulf, one foot already committed to the next stone ahead. Every stone behind them burns gold where they have trodden, and the whole span in front stays cold and unlit, waiting on the step they have not taken yet.",
    assignments: [
      "Be the first one moving, before it feels reasonable.",
      "The moment was only ever waiting for you.",
    ],
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
    bio: "The friend who is always introducing people. Remembers what you said you loved, spots who else loves it, and puts you together.",
    sceneStory:
      "On a dark plain between two far hills, each crowned by a single lonely star, a figure holds a glowing thread pulled down from each one. They twist the two ends together and the join flares white, a taut line of light snapping into place between the two stars.",
    assignments: [
      "Introduce the two who were always going to find each other.",
      "You're simply the moment it happens.",
    ],
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
    bio: "The one who picks a spot and stays there all night. Easy to find on purpose, so everyone has somewhere to come back to.",
    sceneStory:
      "On a spit of black rock ringed by churning, silver-capped waves, a figure stands with feet apart and chest open, light pouring out of them in a wide amber road across the dark water. Far out along that road, a small three-masted ship with torn sails swings its bow around to come in.",
    assignments: [
      "Don't chase the crowd — pick your spot and glow.",
      "What's meant for you comes to you.",
    ],
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
    bio: "The one you end up talking to for three hours. Gives you their whole attention and hears the thing underneath what you said.",
    sceneStory:
      "On the black shore of a perfectly still lake, a figure crouches and touches one fingertip to the water. Out on the mirrored surface a single reflected star begins to ring and brighten, answering the touch with a slow spreading circle of light.",
    assignments: [
      "Give one person your whole signal.",
      "The universe says its deepest things quietly.",
    ],
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
    bio: "The friend who notices you have gone quiet. Spots who is fading and gets to them with warmth before they think to ask.",
    sceneStory:
      "In a wide dark meadow where dozens of fallen stars lie half-buried and barely glowing in the grass, a figure kneels and lifts one cold, flickering star into cupped hands. They bend close and breathe on it until it flares awake in their palms — bright enough now to show three more dim ones waiting nearby.",
    assignments: [
      "Reach the person fading before they ask.",
      "No light stays lit alone.",
    ],
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
    bio: "The one who wanders off and comes back with a story. Follows whatever pulls them past the marked path, and finds what nobody else did.",
    sceneStory:
      "Crossing a desert of violet dunes under a huge low moon, a figure steps off a clearly marked path and strikes out into open sand. Their footprints trail behind them away from the path, aimed at a single pulsing light on the far horizon.",
    assignments: [
      "Trust your feet over the map.",
      "You always arrive where you're needed.",
    ],
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
    bio: "The class clown who grew up kind. Quick with the joke that lets a stuck moment breathe, and happy to be laughed at so nobody else has to risk it.",
    sceneStory:
      "Head thrown back mid-laugh, a harlequin lifts off the floor of a deep, dark canyon, carried upward by nothing at all. They tumble head-over-heels into a field of stars, laughter streaming behind them like the tail of a comet.",
    assignments: [
      "Take the work seriously and nothing else.",
      "Anything heavy is one laugh from lifting.",
    ],
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
    bio: "The one still going long after the others flagged. Holds the same steady pace all night, and everyone finds their rhythm off it.",
    sceneStory:
      "Sitting cross-legged at the exact center of a vast, glass-still black lake, a figure brings one open hand down onto the water. A single ring of light springs from the strike and races outward across the whole mirrored surface toward the horizon.",
    assignments: [
      "Find the rhythm under all the noise and hold it.",
      "The whole night falls into step.",
    ],
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
    bio: "The friend with the uncanny gut. Calls the shift in a night before anything has visibly changed, and is usually right.",
    sceneStory:
      "On a bare hilltop under a clear and perfectly calm night sky, a hooded figure stands with their face lifted and their eyes shut. In the small patch of sky directly above them a violent storm is already breaking — lightning, black cloud — while the night for miles around stays entirely still.",
    assignments: [
      "Trust the hunch before it makes sense.",
      "Knowing always arrives before the proof.",
    ],
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
    bio: "The host who stays at camp. Keeps the fire going and something warm ready, so coming back is the easiest thing in the world.",
    sceneStory:
      "In the middle of an endless dark plain, a figure crouches low and feeds a small campfire back up into a blaze. Theirs is the only spot of warmth for miles, and a single lit path winds out of the darkness straight to the fire.",
    assignments: [
      "Be the place everyone drifts back to.",
      "Everything that wanders comes home.",
    ],
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
    bio: "The one who remembers everything. Holds the whole night while the rest of you disappear into it, and hands it back the next day.",
    sceneStory:
      "At the rim of a canyon overlooking a valley flooded with glowing light, a figure raises both hands and draws them slowly upward. The whole scene below lifts and spools into a long ribbon of light that winds up and coils around them.",
    assignments: [
      "Don't just live the night — keep it.",
      "What's remembered never really ends.",
    ],
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
    bio: "The last one awake. Sees the long stretch through to dawn, and is still there when the sky turns.",
    sceneStory:
      "Alone on a high ridge, a figure stands facing east with grains of starlight falling steadily through the air all around them. Along the black horizon a thin line has just cracked open into the first blue of dawn.",
    assignments: [
      "Stay awake when the others have gone.",
      "The dawn belongs to whoever waited for it.",
    ],
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
    bio: "The one who makes any space feel special. Tends the corner nobody else noticed until people soften just from being in it.",
    sceneStory:
      "Crossing a cracked grey wasteland, a figure walks steadily with one hand trailing low at their side. In the line behind every footstep, glowing flowers are bursting up out of the dead ground and opening.",
    assignments: [
      "Make one plain corner beautiful.",
      "People become the magic a place promises them.",
    ],
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
    bio: "The one who brings new people in. Watches the edge of the group for whoever is standing alone, and waves them over.",
    sceneStory:
      "In the middle of an empty dark field stands a single freestanding door, warm light pouring out around its edges. A figure leans into it holding it wide open, one arm stretched out, waving a hesitant newcomer in from the dark.",
    assignments: [
      "See the one still outside the light, and wave them in.",
      "Someone once did it for you.",
    ],
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
    const full = { ...card, tagline: "" };
    await writeIfMissing(path.join(DECK_DIR, card.slug, "card.json"), full);
  }
  console.log(`\nDone. ${CARDS.length} cards.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
