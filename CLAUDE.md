# CLAUDE.md

Guidance for Claude Code (and future-Justin) when working in this project.

## What this is

**Department of Intergalactic Vibrations (D.I.V.)** — a fictional cosmic agency Justin and friends play as live characters at festivals, debuting at **Seven Stars festival**. Costume, persona, brand, artifacts (badges, cards, stickers, gadgets), and a recruitment mechanic to draw festival-goers into the universe.

Goal: surprise and delight people. Create memorable, slightly unreal interactions. Eventually back the bit with a story-driven website that diggers can fall into.

## Files

- **`README.md`** — public-facing in-universe orientation. The new-agent handbook. Read first.
- **`BRAND.md`** — brand foundation (identity, positioning, voice, aesthetic, locked decisions). _May not exist yet — referenced in project memory; add when ready._
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
- `entity` — a thing or being in the universe (the Department, HQ, Seven, the Pleiades office)
- `concept` — an idea or system (the Grid, field doctrine, the Awakening)
- `thread` — an open narrative thread, often unresolved on purpose
- `artifact` — an in-universe document (Sightings Log, field reports, etc.)

**Statuses:**
- `canon` — locked. Don't undo without a reason.
- `draft` — working, may change.
- `open-question` — **deliberately unresolved.** Load-bearing mystery. **Do not accidentally close.** The not-knowing is the point.

### Cross-linking

Within `lore/`, use wiki-style `[[name]]` links to reference other files. The `name` matches the file's filename minus `.md`. A `[[link]]` to a file that doesn't exist yet is a *prompt* — it marks something worth writing later. That's fine.

In `README.md` (which renders on GitHub and elsewhere), use standard relative markdown links: `[the awakening](lore/the-awakening.md)`.

### Tone

Every lore file should pass the **"would a real field agent write it this way?"** sniff test.

- Bureaucratic-but-warm. Technical-but-mystical. Sincere.
- The agency takes itself seriously without being self-serious. The work is real. The forms are real. The Grid is real.
- **Never wink at the reader.** No "isn't this fun" energy. No genre self-awareness. Play it straight. The whimsy emerges from sincerity, not from irony.
- Institutions in this universe are old, accreted, and mostly benign — not corporate, not cynical, not evil. Bureaucracy here is closer to a monastery's record-keeping than a megacorp's compliance department.

## Locked decisions (project memory)

- Crew = purple hi-vis utility workers tending the Resonance Grid + investigating anomalies
- Earth festivals = grid spikes; we get assigned because we love it here (no conspiracy)
- Aesthetic = cosmic industrial (trade union + retro space program) + psychedelic texture
- Astrology = operational framework, not mysticism (Grid is organized by constellations)
- Seven Stars = the Pleiades cluster; this weekend's crew = Pleiades Field Office
- Interaction tiers: sticker → commendation card → provisional induction
- On-duty in uniform, off-duty at campsite

## Central mystery: Seven

The Recurring Agent. Shows up across centuries. Manifests differently for everyone — identified by signatures (a question, a hand-off, unusual presence) never by features. **Seven is NOT planted** — no agent literally pretends to be Seven, no objects are physically distributed as "from Seven." The mystery works because Seven is what each person decides their unusual encounter was. The brand provides the *frame*; the world provides the manifestation.

See `lore/seven.md` and `lore/who-is-seven.md`. Open question — do not resolve.

## How to work in this project

- **Careful, iterative decisions.** Run choices by Justin one at a time. Don't bulk-draft lore. Don't lock canon without checking.
- **Open questions are sacred.** When in doubt, leave a mystery open. Closing mysteries is harder to undo than opening them.
- **Edit, don't rewrite.** Lore files accrete like the agency itself. Add a paragraph, sharpen a line, mark a new thread. Don't blow up existing files unless asked.
- **Keep `LORE.md` current.** New file in `lore/` → new line in `LORE.md`.
- **Tone discipline above all.** A file that drifts off-tone is worse than a file that's incomplete.

## Roadmap (open)

- Populate `BRAND.md` (referenced in memory, not yet in repo).
- Flesh out the `lore/sightings-log.md` with a working set of dated entries across eras.
- Decide which open threads to develop further (the Long Letter, empty HQ, who is Seven).
- Eventually: story-driven website that diggers can navigate. Links on physical cards point here.
- Artifact design follows lore — not the other way around.
