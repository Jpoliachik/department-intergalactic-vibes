<!-- WORKING DRAFT — art direction for the Field Specialty card images.
     Pairs with ASSIGNMENTS.md (one image per card). Status: draft.
     Goal: 16 cards that read as ONE deck. Lock the spine, vary a few slots. -->

# Card Image Brief

_Department of Intergalactic Vibrations — Field Specialty deck_

Art direction for the 16 card images in [`ASSIGNMENTS.md`](ASSIGNMENTS.md). The whole point of this doc: make sixteen images feel like **one deck**, not sixteen experiments. We do that by locking most of the prompt and varying only a few slots per card.

---

## The recipe

Every card is a tarot composition:

> **One agent figure · their Object · one scene cue.**

Character *and* scene, fused — the way a Rider-Waite card is always a figure performing one symbolic action. The agent on the card is a little bit _the person receiving it_ — the card names who they already are — so the figure stays **universal**, not a specific named character.

**Visored, not faced.** Every agent wears the purple hard hat with a tinted reflective visor down. This (1) is peak cosmic-industrial, (2) keeps the figure universal so any festival-goer projects onto it, and (3) sidesteps the hardest problem in a 16-image series: face consistency. No face to keep, no drift.

---

## Locked (identical on all 16)

- **Costume:** purple high-visibility utility vest with reflective silver striping; purple hard hat bearing a small circular agency seal; tinted reflective visor down; ID badge on a lanyard.
- **Palette:** agency purple · one warm amber "signal" glow · deep cosmic indigo · star-white. Nothing else.
- **Composition:** single figure, centered, tarot framing, the Object the brightest point, thin border, field-name banner at the bottom, designation code in a corner.
- **Texture:** riso / screenprint halftone grain, flat bold shapes, a slight ink-misregistration glow around any light source.
- **Sky:** deep indigo night with stars; a faint constellation behind the figure.

## Variable (per card)

- **Action / pose** — what the figure is doing
- **Object** — the single symbol they carry
- **Scene cue** — one environmental detail, nothing more
- **Constellation** — the star pattern behind them _(optional layer; the crew's own cluster is the Pleiades / Seven Stars)_

---

## Style directions (pick one to standardize)

1. **Mid-century screenprint — "union hall meets NASA golden age."** _(recommended)_ Flat bold shapes, limited palette, WPA labor-poster + JPL "Visions of the Future" energy, riso grain, a little ink misregistration. Most on-brand, prints beautifully, and flat graphic styles hold consistent across a series far better than painterly ones.
2. **Colorized tarot engraving — Rider-Waite woodcut, recolored cosmic.** Line-heavy, esoteric, mysticism turned all the way up. Risk: reads olde-worlde rather than _agency_; fine linework is fussier to keep uniform.
3. **Painted retro-pulp sci-fi — '60s gouache paperback covers.** Warmest and most romantic. Hardest to hold consistent across 16 — expect style drift and heavy curation.

---

## Prompt template

Keep everything below identical card to card; swap only the **[bracketed]** slots.

> `[STYLE BLOCK]`. A single field agent, centered, `[ACTION]`, holding `[OBJECT]`. The agent wears a purple high-visibility utility vest with reflective silver striping, a purple hard hat with a small circular agency seal, and a tinted reflective visor down over the face. `[SCENE CUE]`. Deep cosmic-indigo night sky with `[CONSTELLATION]` faintly above. Flat bold shapes, limited palette of purple, warm amber, indigo and star-white, riso halftone grain, slight ink-misregistration glow. Centered full-body tarot composition, symmetrical, thin border, the object the brightest point. Field name `[FIELD NAME]` on a bottom banner, designation code `[CODE]` in the corner.

---

## Per-card slot reference

| Card | Code | Object | Action | Scene cue |
|---|---|---|---|---|
| The Fool | 00 | empty cup | stepping forward, cup upturned and offered | at the edge of an open, glowing threshold |
| The Anchor | GT-01 | anchor | standing planted, one hand on a heavy anchor | a blurred crowd swirling around a figure held sharp and still |
| The Spark | IS-02 | lit match | mid-step, striking a match aloft | first onto an empty dancefloor |
| The Connector | LS-03 | splice | joining two glowing cable-ends together | two distant figures with a new line of light between them |
| The Beacon | SL-04 | lantern | planted and calm, lantern raised at shoulder height | small silhouettes drifting toward the light |
| The Tuner | RL-05 | tuning fork | leaning in, a humming tuning fork raised | one other figure close and lit; the rest of the world dim |
| The Caretaker | FM-06 | water bottle | kneeling, offering water | tending a seated figure who has dimmed |
| The Wanderer | FP-07 | compass | mid-stride, reading a glowing compass | a hidden forked trail and a far horizon |
| The Jester | BT-08 | balloon | mid-laugh, holding a balloon | a long queue behind them turned playful |
| The Pulse | TR-09 | metronome | hand keeping time above a glowing metronome | a crowd moving in rhythmic step behind |
| The Oracle | DV-10 | crystal ball | hands cupped around a glowing crystal ball | swirling omens and weather in the sky above |
| The Keeper of Base | QM-11 | kettle | tending a kettle over a small flame | a warm campsite of tents, the spot everyone returns to |
| The Witness | OC-12 | film camera | raising a film camera to the visor | the whole night framed behind them |
| The Sentinel | NW-13 | hourglass | standing watch, hourglass in hand | a predawn horizon, first bruised-blue light, a last small circle |
| The Enchanter | GL-14 | fairy lights | stringing fairy lights between poles | a plain patch of ground transformed and glowing |
| The Mentor | IN-15 | key | holding out a key, beckoning | a figure at the edge of the light being waved in |

_Optional constellation layer (astrology as operational framework): map each post to a zodiac function — e.g. Spark→Aries (initiation), Connector→Gemini (pairs), Keeper→Cancer (hearth), Wanderer→Sagittarius (the roamer), Oracle→Pisces (the mystic). Leave loose until the visual style is locked._

---

## Workflow

1. Lock the **style** on ONE pilot card (**The Beacon** — it exercises figure, object, scene, glow, and sky all at once).
2. Generate variations, pick the winner, freeze that style block.
3. Only then roll out all 16 by swapping slots. Curate for consistency.
