# CLAUDE.md

Guidance for Claude Code (and future-Justin) when working in this project.

## What this is

**Vibe Corp** — a fictional cosmic outfit Justin and friends play as live characters at festivals, debuting at **Seven Stars festival**. Costume, persona, brand, artifacts (badges, cards, stickers, gadgets), and a recruitment mechanic to draw festival-goers into the universe.

Goal: surprise and delight people. Create memorable, slightly unreal interactions. Eventually back the bit with a story-driven website that diggers can fall into.

## Files

- **`README.md`** — public-facing in-universe orientation. The new-crew handbook. Read first.
- **`LORE.md`** — index / map of the lore web. The table of contents for everything in `lore/`.
- **`lore/`** — the lore web. One markdown file per entity, concept, thread, or artifact. Flat folder, cross-linked.

## Working with the lore web

### Conventions

Every lore file has frontmatter:

```markdown
---
type: entity | concept | thread | artifact
status: canon | draft | open-question
description: one-line summary
---
```

**Types:**

- `entity` — a thing or being in the universe (Vibe Corp, Seven)
- `concept` — an idea or system (the Grid)
- `thread` — an open narrative thread, often unresolved on purpose

**Statuses:**

- `canon` — locked. Don't undo without a reason.
- `draft` — working, may change.
- `open-question` — **deliberately unresolved.** Load-bearing mystery. **Do not accidentally close.** The not-knowing is the point.

### Cross-linking

Within `lore/`, use wiki-style `[[name]]` links to reference other files. The `name` matches the file's filename minus `.md`. A `[[link]]` to a file that doesn't exist yet is a _prompt_ — it marks something worth writing later. That's fine.

In `README.md` (which renders on GitHub and elsewhere), use standard relative markdown links: `[Vibe Corp](lore/vibe-corp.md)`.

### Tone

Every lore file should pass the **"would someone who actually works the Grid write it this way?"** sniff test.

- Warm. Technical-but-mystical. Sincere.
- Vibe Corp takes itself seriously without being self-serious. The work is real. The Grid is real.
- **Never wink at the reader.** No "isn't this fun" energy. No genre self-awareness. Play it straight. The whimsy emerges from sincerity, not from irony.
- Vibe Corp is old, accreted, and mostly benign — not cynical, not evil, and **not a megacorp**. "Corp" here is a worn-in name nobody questions, not a satire target. No compliance jokes, no middle management, no office culture.
- **No DMV energy.** Avoid the bureaucratic-comedy register: forms, paperwork, filing cabinets, citations, memos, clearance levels, red tape. The old-institution feel comes from age and accretion, not from process.
- **Deliberately vague about what Vibe Corp *is*.** Company, guild, lineage, long-running misunderstanding — never settle it. Keep institutional vocabulary light: people are **crew**, not agents or employees. (Exception: Seven is "the Recurring Agent" — an older designation that predates the current scheme. Canon, keep it.)

## Card layout rules

These apply to every printed artifact — the field-specialty deck, commendation cards, anything that goes to a printer.

- **Print margin is mandatory.** Art may bleed to the trim edge. **Readable content never may.** Every text element, plate, code and mark sits inside a safe margin of **7% of the card width** on all four edges. A trim that drifts should eat artwork, never meaning.
- **Size everything relative to the card, not the screen.** Card faces use a container query (`container-type: inline-size`) and `cqw` units, so the grid preview and the printed 63×88mm card are the same design at different scales. No fixed `px` type on a card face.
- **Cards are carried by the figure's action and the world around them — never by a held object.** No hero props, nothing presented to camera. The per-card `object` is a loose seed for writing scenes, not a thing that has to appear.
- **Current deck face:** full-bleed art band across the top, card width by **68% of card height**. The art is still generated square (1:1); the band is shorter than a square on purpose, so the text plate has room — `object-cover` trims the difference evenly top and bottom, and each card's own framing (`imageScale` / `imageOffsetY`, adjustable in the studio) decides what survives the trim. Name + designation in a bordered plate over the art, top left; the classification code in a matching bordered bubble, monospace, top right — both inset **11% of card width** from the top, the print margin plus a visual margin, so the title reads as placed rather than pushed against the trim. Below a hairline mustard rule with a seven-star ornament straddling it: the tagline in serif, then the two star-bulleted assignments. The text plate pads 7% at the top (an internal divider, not a card edge) and **11% at the bottom** — wider than the print margin, so the last line ends with air under it rather than on the margin line.
- **The tagline** is the card's one serif line — the character's truth in a sentence, authored by hand, not generated. It replaced the earlier "field reading" koan (and a per-character quote before that); the card carries no other loose line.
- **Every card is rooted in one piece of classic wisdom** (the Rookie = shoshin/beginner's mind, the Mirror = sakshi, the Enchanter = hózhó, …), stored per card as `wisdomRoot`. The root is never printed, quoted, or named on the card — the bio, tagline, and assignments *point back* at it in plain English. When editing card copy, read the root first and cut every word that isn't carrying it.
- **Two assignments** carry the doing — a **small standing practice, phrased as a gentle imperative** ("Ask the question you think is dumb.", "Move toward the quiet one.", "Leave a silence before you reply."). Each is the card's wisdom root translated into one concrete move a festival-goer can make tonight, and again tomorrow — a way of being pointed at one moment, not an errand to tick off. (This replaced the earlier permission-not-order doctrine.) Failure modes: **too abstract** — if the reader can't picture the exact moment in thirty seconds, it fails ("Glitter the dark corners"); **a chore** — nothing scheduled, counted, located, or crossable off a list; **teeth** — an invitation in imperative clothes, nothing that dares, shames, or puts the reader on the spot; **quoting the root** — the wisdom steers the line, never appears in it. The two must differ in kind — often one toward other people, one toward your own state or pace. Themed to the character without restating their job. 3–7 words, max 34 characters including the final period, mono, star-bulleted. Enforced at generation.

## Locked decisions (project memory)

- Name = **Vibe Corp** (renamed from Department of Intergalactic Vibrations / D.I.V.)
- Crew = purple hi-vis utility workers tending the Resonance Grid + investigating anomalies
- Earth festivals = grid spikes; we get assigned because we love it here (no conspiracy)
- Aesthetic = cosmic industrial (trade union + retro space program) + psychedelic texture
- Astrology = operational framework, not mysticism (Grid is organized by constellations)
- Seven Stars = the Pleiades cluster; this weekend's crew = Pleiades Field Office
- Interaction tiers: sticker → commendation card → provisional induction
- On-duty in uniform, off-duty at campsite

## Central mystery: Seven

The Recurring Agent. Shows up across centuries. Manifests differently for everyone — identified by signatures (a question, a hand-off, unusual presence) never by features. **Seven is NOT planted** — nobody on crew literally pretends to be Seven, no objects are physically distributed as "from Seven." The mystery works because Seven is what each person decides their unusual encounter was. The brand provides the _frame_; the world provides the manifestation.

See `lore/seven.md` and `lore/who-is-seven.md`. Open question — do not resolve.

## How to work in this project

- **Careful, iterative decisions.** Run choices by Justin one at a time. Don't bulk-draft lore. Don't lock canon without checking.
- **Open questions are sacred.** When in doubt, leave a mystery open. Closing mysteries is harder to undo than opening them.
- **Edit, don't rewrite.** Lore files accrete like Vibe Corp itself. Add a paragraph, sharpen a line, mark a new thread. Don't blow up existing files unless asked.
- **Keep `LORE.md` current.** New file in `lore/` → new line in `LORE.md`.
- **Tone discipline above all.** A file that drifts off-tone is worse than a file that's incomplete.

## Roadmap (open)

- Populate `BRAND.md` (referenced in memory, not yet in repo).
- Lock the README tagline (currently _Keeping the galaxy's vibrations in tune._).
- Decide which open threads to develop further (empty HQ, who is Seven).
- Eventually: story-driven website that diggers can navigate. Links on physical cards point here.
- Artifact design follows lore — not the other way around.

## Lore minimalism

Keep the web small. Five files is enough right now: `vibe-corp`, `seven`, `who-is-seven`, `resonance-grid`, `empty-hq`. Adding a sixth requires a clear reason — a thread Justin wants diggers to follow, not just a corner of the world that could be filled in. When in doubt, leave it implied.
