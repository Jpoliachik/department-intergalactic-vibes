<!-- WORKING DRAFT — art direction for the Field Specialty card images.
     Pairs with ASSIGNMENTS.md (one image per card). Status: draft.
     Goal: 16 images that read as ONE deck. Lock the spine, vary a few slots. -->

# Card Image Brief

_Department of Intergalactic Vibrations — Field Specialty deck_

Art direction for the 16 card images in [`ASSIGNMENTS.md`](ASSIGNMENTS.md). The whole point of this doc: make sixteen images feel like **one deck**, not sixteen experiments. We do that by locking most of the prompt and varying only a few slots per card.

**Style is locked: mid-century screenprint** — "union hall meets NASA golden age." Flat bold shapes, limited palette, WPA labor-poster + JPL "Visions of the Future" energy, riso grain, a little ink misregistration. Prints beautifully, and flat graphic styles hold consistent across a series far better than painterly ones. _(Colorized tarot engraving and painted retro-pulp were considered and set aside.)_

---

## The recipe

Every image is a tarot composition:

> **One agent figure · their Object · a scene with depth.**

Character *and* scene, fused — the way a Rider-Waite card is always a figure performing one symbolic action, but the world behind them earns its keep. The agent is a little bit _the person receiving the card_ — it names who they already are — so the figure stays **universal**, not a specific named character.

**Render the illustration ONLY.** No card border, no field-name banner, no designation code baked into the image. Those are composited in layout afterward. Prompt for the art.

**Visored, not faced.** Every agent wears the purple hard hat with a tinted reflective visor down. This (1) is peak cosmic-industrial, (2) keeps the figure universal so any festival-goer projects onto it, and (3) sidesteps the hardest problem in a 16-image series: face consistency. No face to keep, no drift. Bonus: the visor catches the glow of whatever they carry.

---

## Locked (identical on all 16)

- **Framing:** tighter than full-body — roughly three-quarter length, the agent large and **popping forward** off the scene. Character-forward, not a small figure lost in a field. The Object is the brightest point.
- **Costume + gear:** purple high-visibility utility vest with reflective silver striping that catches the light; purple hard hat with a small circular agency seal; tinted reflective visor down; ID badge on a lanyard; a loaded tool belt — a beeping resonance meter with little dials and indicator lights, a coiled cable, a walkie-talkie; work gloves; sturdy boots; embroidered patches (agency seal, a seven-star Pleiades patch, an agent number). Weathered, well-used, believable.
- **Palette:** agency purple · one warm amber "signal" glow · deep cosmic indigo · star-white. Nothing else.
- **Texture:** riso / screenprint halftone grain, flat bold shapes, a slight ink-misregistration glow around any light source.

## Scene depth (the background must be a WORLD, not a flat void)

Build the scene in layers so the character pops but the world is alive behind them:

- **The sky / the Grid:** a glowing geometric lattice of ley-lines arcing across a deep-indigo sky — the Resonance Grid drawn as a constellation power grid. Stars, and one oversized retro-space-program planet or moon low on the horizon.
- **Midground:** small silhouettes, festival structures — stage scaffolding and truss towers, strings of lights, pennants and flags, tents.
- **Atmosphere:** volumetric haze and light beams catching amber and purple, drifting embers or dust, depth and glow.
- **Foreground:** the agent and their Object, sharp and lit.

## Variable (per card)

- **Action / pose** — what the figure is doing
- **Object** — the single symbol they carry
- **Scene cue** — the specific festival moment behind them
- **Constellation** — the pattern in the Grid-sky _(optional layer; the crew's own cluster is the Pleiades / Seven Stars)_

---

## Prompt template

Keep the style, costume, palette and texture identical card to card; swap the **[bracketed]** slots. Illustration only — no card frame or text.

> Mid-century screenprint illustration, 1960s NASA space-program poster crossed with a WPA labor-union poster. Tight three-quarter framing of a single field agent, large in frame and popping forward, `[ACTION]`, holding `[OBJECT]`. The agent wears a purple high-visibility utility vest with reflective silver striping, a purple hard hat with a small circular agency seal, a tinted reflective visor down, a loaded tool belt with a beeping resonance meter, coiled cable and walkie-talkie, embroidered mission patches. Behind them, a living festival-at-night scene: `[SCENE CUE]`, stage scaffolding and string lights, small drifting silhouettes, volumetric haze catching amber and purple light. Deep cosmic-indigo sky with a glowing geometric Resonance-Grid lattice and `[CONSTELLATION]`, one oversized retro planet low on the horizon. Flat bold shapes, limited palette of purple, warm amber, indigo and star-white, riso halftone grain, slight ink-misregistration glow, the object the brightest point. No border, no text.

---

## Per-card slot reference

| Card | Code | Object | Action | Scene cue |
|---|---|---|---|---|
| The Fool | 00 | empty cup | stepping forward, cup upturned and offered | an open, glowing threshold at the field's edge |
| The Anchor | GT-01 | anchor | planted, one hand on a heavy anchor | a blurred crowd swirling around a figure held sharp and still |
| The Spark | IS-02 | lit match | mid-step, striking a match aloft | the first spark over an empty dancefloor |
| The Connector | LS-03 | splice | joining two glowing cable-ends together | two distant figures with a new line of light between them |
| The Beacon | SL-04 | lantern | planted and calm, lantern raised at shoulder height | silhouettes drifting toward the light from across the grounds |
| The Tuner | RL-05 | tuning fork | leaning in, a humming tuning fork raised | one other figure close and lit; the rest of the world dim |
| The Caretaker | FM-06 | water bottle | kneeling, offering water | tending a seated figure who has dimmed |
| The Wanderer | FP-07 | compass | mid-stride, reading a glowing compass | a hidden forked trail and a far horizon of lights |
| The Jester | BT-08 | balloon | mid-laugh, holding a balloon | a long queue behind them turned playful |
| The Pulse | TR-09 | metronome | hand keeping time above a glowing metronome | a crowd moving in rhythmic step behind |
| The Oracle | DV-10 | crystal ball | hands cupped around a glowing crystal ball | swirling omens and weather in the Grid-sky above |
| The Keeper of Base | QM-11 | kettle | tending a kettle over a small flame | a warm campsite of tents, the spot everyone returns to |
| The Witness | OC-12 | film camera | raising a film camera to the visor | the whole glowing night framed behind them |
| The Sentinel | NW-13 | hourglass | standing watch, hourglass in hand | a predawn horizon, first bruised-blue light, a last small circle |
| The Enchanter | GL-14 | fairy lights | stringing fairy lights between poles | a plain patch of ground transformed and glowing |
| The Mentor | IN-15 | key | holding out a key, beckoning | a figure at the edge of the light being waved in |

_Optional constellation layer (astrology as operational framework): map each post to a zodiac function — e.g. Spark→Aries (initiation), Connector→Gemini (pairs), Keeper→Cancer (hearth), Wanderer→Sagittarius (the roamer), Oracle→Pisces (the mystic). Leave loose until the visual style is locked._

---

## Workflow

1. Lock **framing + scene richness** on the pilot card (**The Beacon** — it exercises figure, object, scene, glow, and Grid-sky all at once).
2. Generate variations, pick the winner, freeze the style + scene-depth blocks.
3. Only then roll out all 16 by swapping slots. Curate for consistency.
