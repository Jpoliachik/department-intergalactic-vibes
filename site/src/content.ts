// Site-only copy: the words that exist on vibecorp.live and nowhere else.
// Card facts (name, code, tagline, bio, assignments, art) come from
// card-studio/deck via `npm run sync` → deck.json. Screen-by-screen prose
// lives in screens.ts beside the choices it leads to.

/** One line per post per day: each post steps through its own fixed shuffle
 *  of these (see readingFor in screens.ts). More lines means a longer cycle. */
export const READINGS = [
  "Signal clean. Carry on exactly as you are.",
  "Something you left behind is still humming. Go back for it.",
  "Low tide today. Let the quiet do its work.",
  "Someone is about to ask you a good question. Answer slowly.",
  "Interference near the heart. Nothing broken. Just loud.",
  "The frequency you've been waiting for is already playing.",
  "Today, the small thing is the big thing.",
  "A door you thought was a wall. Lean on it.",
  "Your signal carries further than you think.",
  "Hold still long enough and the room tunes to you.",
  "Static clears by evening.",
  "Someone near you is running low. You have extra.",
  "Say the true thing. The Grid can take it.",
  "Unmarked path ahead. The meter says yes.",
  "You read louder when you're laughing.",
  "Old signal, new song.",
];

/** Greetings for a card holder coming back: `short` is "Anchor", `full` is "The Anchor". */
export const RETURNS: ((short: string, full: string) => [string, string])[] = [
  (short) => [`Welcome back, ${short}.`, "Still on file. The signal's held."],
  (_, full) => ["There you are again.", `Still reading you as ${full}.`],
  () => ["Back on the channel.", "Nothing's moved. Your post is where you left it."],
  (short) => [`${short}. Good.`, "The signal's held since you were last here."],
];

/** Labels for the bar while a card code resolves. */
export const TUNING = ["Tuning", "Clearing static", "Finding your frequency", "Holding the line"];

/** Behind "Did you hear that?": rare, never signed by anyone, never explained.
 *  A device hears each once before any repeats. */
export const RARE = [
  "For a second the channel carried music. Not from here.",
  "Every meter on Sol-3 ticked at once. Nobody has said why.",
  "The static made a shape, briefly. Like a door left open.",
  "The wind stopped. Then it started again, in time with you.",
  "Someone on the line said the name of your sector. Then nothing.",
  "Someone laughed, very far away. The whole line moved.",
  "A frequency nobody has logged before. It stopped when we listened.",
  "For a moment every light on the Grid leaned the same way.",
  "Two strangers said the same word at the same time. The line went bright.",
  "Nothing. Then, underneath the nothing, a hum.",
  "The signal paused, as if it were listening back.",
  "Somewhere a fire just caught. The whole channel warmed.",
];

/**
 * Self-calibration. Each answer nudges toward a few posts; the most-nudged
 * post is the leaning, ties broken by the exact answers given.
 */
export const CALIBRATION: { ask: string[]; answers: [string, string[]][] }[] = [
  {
    ask: ["Hold your device level.", "Is it humming?"],
    answers: [
      ["Yes", ["the-tuner", "the-oracle", "the-deep-diver"]],
      ["No", ["the-anchor", "the-patchwork", "the-mentor", "the-beacon"]],
      ["I can't tell", ["the-rookie", "the-wanderer", "the-jester"]],
    ],
  },
  {
    ask: ["Think of the last time the signal was strong. Really strong.", "Where were you?"],
    answers: [
      ["In a crowd", ["the-pulse", "the-spark", "the-jester", "the-enchanter"]],
      ["By a fire", ["the-fire-tender", "the-caretaker", "the-anchor", "the-mentor"]],
      ["Mid-conversation", ["the-connector", "the-tuner", "the-caretaker"]],
      ["Somewhere alone", ["the-wanderer", "the-deep-diver", "the-oracle", "the-beacon"]],
    ],
  },
  {
    ask: ["Something is coming toward you across a dark field.", "You:"],
    answers: [
      ["Go meet it", ["the-spark", "the-wanderer", "the-rookie", "the-pulse"]],
      ["Hold your ground", ["the-anchor", "the-beacon", "the-patchwork"]],
      ["Wave it over", ["the-connector", "the-fire-tender", "the-mentor", "the-enchanter", "the-caretaker"]],
    ],
  },
];

export type PostLore = { field: string; grid: string; heavy: string; near: string; root: string[] };

/**
 * "Read the card closer": a portrait of the post, then the wisdom it's
 * rooted in. The card itself never names the root; this is where it's said.
 */
export const POSTS: Record<string, PostLore> = {
  "the-rookie": {
    field: "First to ask what everything is. Wristband too tight, grin too wide. Has never once pretended to know the words.",
    grid: "An open channel takes in signal nobody else is tuned for. The Rookie hears the festival the way it actually sounds, before habit files it away.",
    heavy: "When everyone else seems to know the way, the Rookie can feel behind. They aren't. They're still listening.",
    near: "The Mentor",
    root: [
      "A Zen teacher named Shunryu Suzuki called it shoshin: beginner's mind.",
      "In the beginner's mind, he said, there are many possibilities. In the expert's, only a few.",
      "The Rookie keeps the first kind open on purpose. Being new isn't the stage before the work. It's one of the ways the work gets done.",
    ],
  },
  "the-anchor": {
    field: "Usually at the edge of the dancing, not the middle. Knows where the water is, where camp is, what time it is. People drift back to them without deciding to.",
    grid: "When the signal surges, something has to stay put so it keeps a shape. The Anchor is the fixed point the rest of the night bends around.",
    heavy: "Holding still for everyone can turn into never getting to move. Every so often the Anchor needs someone to hold them.",
    near: "The Deep Diver",
    root: [
      "The Buddhists call it upekkha: equanimity. The Stoics built it as an inner citadel, a room in you the weather can't reach.",
      "The Tao Te Ching asks it as a question: who can wait, still, until the mud settles and the water runs clear?",
      "The Anchor can. That's the whole post. Everyone else gets to move because one person doesn't.",
    ],
  },
  "the-spark": {
    field: "First onto the empty floor. Says \"let's go\" while everyone else is still deciding. Always slightly ahead of the plan.",
    grid: "Signal needs a first pulse before it can travel. The Spark provides it, and then, crucially, lets it go.",
    heavy: "Going first sometimes means going alone. The Spark can forget to look back and see who followed. Plenty did.",
    near: "The Jester",
    root: [
      "The Tao Te Ching says a journey of a thousand miles begins beneath your feet. Not at the horizon. Where you're standing.",
      "Centuries later the poet Antonio Machado said it again: there is no road. The road is made by walking.",
      "The Spark doesn't know where the path goes. It only appears once they step.",
    ],
  },
  "the-connector": {
    field: "Knows someone at every campsite and remembers what each of them loves. Mid-conversation, suddenly waving a stranger over: you two need to meet.",
    grid: "The Grid is made of connection. The Connector splices new lines into it all night long.",
    heavy: "Busy linking everyone else, the Connector can end the night without a thread of their own. They're allowed to be one end of it too.",
    near: "The Fire Tender",
    root: [
      "Huayan Buddhism describes a net hung across the heavens with a jewel at every knot, each one reflecting every other, without end. Indra's Net.",
      "Ubuntu says it more plainly: I am because we are.",
      "The Connector sees which jewels are already reflecting each other, and makes the introduction.",
    ],
  },
  "the-beacon": {
    field: "Picks a spot and stays in it. The meeting place, with a person attached. Easy to find, hard to forget, never looking for anyone.",
    grid: "Some signal is broadcast rather than sent. The Beacon shines in every direction at once and lets whoever needs it come in.",
    heavy: "Staying put can feel like missing out. It isn't. The whole night is on its way to them.",
    near: "The Wanderer",
    root: [
      "Sailors have steered by Polaris for as long as there have been sailors. Not because it's the brightest star. Because it doesn't move.",
      "Every other star wheels across the night. The pole star stays where it said it would be.",
      "The Beacon serves the same way. Constancy. Being easy to find, on purpose.",
    ],
  },
  "the-tuner": {
    field: "The one you end up telling things to, without quite knowing why. Asks the second question. Waits for the real answer.",
    grid: "Resonance only happens when something receives it. The Tuner is the part of the Grid that takes the signal in.",
    heavy: "Taking everyone in, the Tuner can go quiet and full. They need someone who'll listen back.",
    near: "The Caretaker",
    root: [
      "Simone Weil wrote that attention is the rarest and purest form of generosity.",
      "Thich Nhat Hanh taught deep listening: hearing someone with no aim except to let them be heard.",
      "Resonance works like that. A signal only rings when something is listening for it. The Tuner is the listening.",
    ],
  },
  "the-caretaker": {
    field: "Carries extra water, an extra layer, a spare charger. Notices who's gone pale, who's gone quiet, who's been gone too long.",
    grid: "The Grid dims wherever someone drops out of it. The Caretaker finds the dim spots and brings them back up.",
    heavy: "Tending every light, it's easy to skip your own. The Caretaker's first patient is themselves.",
    near: "The Tuner",
    root: [
      "Two old words from the Buddhist tradition. Metta, loving-kindness: wishing someone well. Karuna, compassion: noticing they're hurting, and moving toward it.",
      "The first is a feeling. The second is a direction.",
      "The Caretaker lives in the second. They're the one already on their way over.",
    ],
  },
  "the-wanderer": {
    field: "Gone for hours, back with a story nobody quite believes. Knows the hidden stage and the shortcut behind the food stalls.",
    grid: "Somebody has to walk the edges of the map. The Wanderer finds where the signal runs strong and nobody's looking.",
    heavy: "Always following the next pull, the Wanderer can forget the pull of home. Someone is keeping a place for them.",
    near: "The Beacon",
    root: [
      "The Tao Te Ching says a good traveller has no fixed plans and is not intent on arriving.",
      "The Latin has a phrase for what happens next: solvitur ambulando. It is solved by walking.",
      "The Wanderer isn't lost. They're surveying. There's more of the Grid off the marked path than on it.",
    ],
  },
  "the-jester": {
    field: "Wearing something ridiculous with total conviction. Says the silly thing first, and loudly, so the whole room can breathe out.",
    grid: "Heavy signal sinks. The Jester lifts it, and the lifting is real work.",
    heavy: "Everyone expects the bit. Now and then the Jester needs a room where they don't have to do it.",
    near: "The Spark",
    root: [
      "Almost every tradition keeps a place for the holy fool. The Lakota heyoka does everything backwards so the people can see it straight. The court jester was the one voice allowed to tell the king the truth.",
      "Chesterton said angels can fly because they take themselves lightly.",
      "The Jester's lightness isn't an accident. It's the function. When one person sets the weight down, a whole room can lift.",
    ],
  },
  "the-pulse": {
    field: "Still dancing at sunrise, somehow not tired. Knows when to push the night on and when to sit in the grass a while.",
    grid: "The Grid has a rhythm: surge and rest. The Pulse keeps it, and the crowd falls into step without noticing.",
    heavy: "Keeping time for everyone, the Pulse can lose their own tempo. Some nights the right beat is stillness.",
    near: "The Anchor",
    root: [
      "Ecclesiastes: to everything there is a season. A time to dance, and a time to be still.",
      "Musicians have always known the rest of it. The music isn't only the notes. It's the space between them.",
      "The Pulse keeps time for both. The beat and the gap, the highs and the lows. A night with no rests in it isn't music.",
    ],
  },
  "the-oracle": {
    field: "Says \"we should go now\" ten minutes before it matters. Rarely explains. Rarely wrong.",
    grid: "The Oracle reads the signal before it arrives: the turn in the crowd, the change in the weather, the moment.",
    heavy: "Knowing without reasons can be lonely. The Oracle needs a few people who'll trust them without asking why.",
    near: "The Tuner",
    root: [
      "Blaise Pascal, a mathematician of all people, wrote that the heart has its reasons which reason knows nothing of.",
      "Some knowing arrives before the explanation. Sometimes the explanation never comes, and the knowing was right anyway.",
      "The Oracle doesn't argue with it. They feel the night turn, and they move.",
    ],
  },
  "the-fire-tender": {
    field: "Back at camp with the kettle on at 3 a.m. Has fed half the field by Sunday and learned most of their names.",
    grid: "Signal gathers wherever people are warm and fed. The Fire Tender builds the place it gathers.",
    heavy: "Everyone comes to the fire. Not everyone thinks to tend the tender. Someone should bring them a plate.",
    near: "The Connector",
    root: [
      "The ancient Greeks kept Hestia's fire burning at the centre of every home and every city. It was never allowed to go out.",
      "They had a word, xenia, for the sacred duty of welcoming a stranger. Feed them first. Ask their name after.",
      "Zen has the rest of it: chop wood, carry water. The holy part is keeping the fire lit.",
    ],
  },
  "the-patchwork": {
    field: "Has tape, a needle, and an opinion about your broken tent pole. Everything they own has been fixed at least once.",
    grid: "Where the Grid tears, the Patchwork closes it and leaves the seam showing, so the line runs stronger than before.",
    heavy: "Mending everything can turn into believing you're the thing that needs mending. The Patchwork is already whole, seams and all.",
    near: "The Enchanter",
    root: [
      "Wabi-sabi is a Japanese way of seeing: beauty in what is imperfect, unfinished, passing.",
      "Kintsugi is what it looks like in the hands. When a bowl breaks, you mend it with gold, and the break becomes the most beautiful part of it.",
      "The Patchwork doesn't hide the seam. The seam is the record that someone cared.",
    ],
  },
  "the-deep-diver": {
    field: "Front and centre, eyes closed, completely gone. Ask them afterwards what the set was like and they'll just look at you.",
    grid: "Some signal only lives at depth. The Deep Diver goes down for it, and brings a little back up in their face.",
    heavy: "Going deep means having to come back up. The Deep Diver needs somewhere solid to surface.",
    near: "The Anchor",
    root: [
      "In Hindu tradition, bhakti is the path of devotion: knowing something by giving yourself to it completely.",
      "You don't learn a river by studying the current from the bank. You get in.",
      "The Deep Diver gets in. Whatever they find down there, they found by letting go.",
    ],
  },
  "the-enchanter": {
    field: "Hangs lights on a fence post. Tucks a flower in your hat. Turns a patch of mud into the spot everyone remembers.",
    grid: "The Grid reads brighter wherever people are paying attention. The Enchanter gives them something worth noticing.",
    heavy: "Making everything beautiful, the Enchanter can forget they're part of the view.",
    near: "The Patchwork",
    root: [
      "The Navajo speak of hózhó, often carried into English as walking in beauty. Not beauty as decoration. Beauty as harmony: something you walk in, and restore wherever it's been lost.",
      "Dostoevsky wrote that beauty will save the world.",
      "The Enchanter doesn't make beauty from nothing. They notice it, and make it harder for everyone else to miss.",
    ],
  },
  "the-mentor": {
    field: "Spots whoever's standing at the edge of the circle and waves them in. Remembers their own first time clearly, and it shows.",
    grid: "The Grid grows one newcomer at a time. The Mentor is where most of them come in.",
    heavy: "Always holding the door, the Mentor can forget they're allowed to walk through a new one.",
    near: "The Rookie",
    root: [
      "In Mahayana Buddhism, the bodhisattva reaches the far shore and turns around, and waits at the threshold until everyone else is across.",
      "There's a plainer phrase for it: lift as you climb.",
      "Someone once held the door for the Mentor. They remember. That's the post.",
    ],
  },
};

