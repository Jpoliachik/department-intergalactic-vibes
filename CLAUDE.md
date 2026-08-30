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
- **Current deck face:** full-bleed **square** art band across the top (card width by card width, 71.6% of card height — it matches the 1:1 aspect ratio requested from the image model, so nothing is cropped); name + designation in a bordered plate over the art, top left; the classification code in a matching bordered bubble, monospace, top right. Below a hairline mustard rule with a diamond ornament straddling it: the field reading in serif, then the two numbered assignments.
- **The field reading** is the card's tarot voice — the koan issued with the draw, set in the ornate serif. Authored by hand, not generated.
- **Two assignments** carry the doing — a **practice, not a task**. Each is a way of paying attention a person can return to at any moment and do again five minutes later, differently: mindfulness in plain clothes. Two failure modes to avoid, and the deck has hit both — **too prescriptive** ("Walk somebody back to camp") is a one-off errand that gets completed; **too nebulous** ("Glitter the dark corners") gives no idea what to actually do. The test has two halves: a person knows what to do in the next thirty seconds, AND could do it a hundred times differently. One line turns outward (how to meet others), one inward (what to catch in your own head). Short imperatives, 2–6 words, max 34 characters, mono, star-bulleted. Enforced at generation.
- **No tagline.** The card carries the field reading and the assignments; a per-character quote was tried and dropped.

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
