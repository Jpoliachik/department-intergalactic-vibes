<!-- WORKING DRAFT — iterating with Justin. Not canon. Status: draft.
     Purpose: screen map for the Seven Stars collection game (PWA).
     The clickable prototype is festival-game-v1.html. This file is the index + decisions log. -->

# Field App — Screen Map v1

Storyboard for the D.I.V. collection game. Open `festival-game-v1.html` to tap through it.

22 screens, 5 flows. Wireframe fidelity — art is placeholder boxes, structure and copy are real.

## Flows

**A · Assignment card** (physical card, handed over by an agent)
`a1` handoff → `a2` free-text name → `a3` the turn (designation revealed) → `a4` first badge

**B · Anon QR** (sticker or found NFC trinket)
`b1` cold open → `b2` frequency → `b3` posture → `b4` tool → `b5` name assigned → `b6` first badge

**Core loop**
`c1` badge (home) · `c2` equipment locker · `c3` new item reveal

**HQ** (needs a connection)
`h1` check-in → `h2` board → `h3` another agent's card · `h4` standings · `h5` envelope → `h6` mystery item

**Edge states**
`e1` already collected · `e2` unknown code · `e3` HQ unreachable

## Decisions locked in this pass

- **The app is D.I.V., and the quiz is the draw.** Designations come from the 16 in `../ASSIGNMENTS.md`. Copy on `a3` is verbatim from the deck so the app and the printed cards can't drift.
- **Oblique questions, hidden mapping.** No menu of roles. Q2 (4 answers) × Q3 (4 answers) = exactly 16 cells, one per designation. Q1 sets aura tint only.
- **Objects come from cards, not codes.** Your designation's Object becomes your starter held item *only* on the card path. Anon players are told their Object exists and that an agent has to hand it over — the app drives people toward a human in a purple vest.
- **Newest item auto-equips**, and the locker exists to undo that.
- **Count only, no locked silhouettes.** Badge shows `7 / 34`; the lineup stays unspoiled.
- **Badge is home, HQ is a door.** No tab bar — the app should read as an issued credential, not software.

## Open questions, by screen

Each screen carries its own open questions in the prototype's notes panel. The ones that change the most downstream:

- `b3` — which 16 answer-pairs map to which designation. The obvious cells are easy; the quiet corners need care.
- `b6` — if an anon player later draws a card with a *different* designation: overwrite, keep the first, or dual posting?
- `b5` / `a3` — no re-roll anywhere, on the grounds that the Grid doesn't deal a wrong card. Right call for lore, possibly rough as a first impression.
- `h1` — check-in TTL of 4h vs 6h. 4h is a genuinely "right now" board; 6h survives a nap.
- `h2` — board density past ~100 check-ins: cap at the 20 most recent, or let it fill up like a real bulletin board?
- `a4` — is 34 the right advertised total? A visible denominator makes completion feel finite.
- `h6` — should the mystery item be visible to others at HQ (spreads the secret) or private (protects it)?

## Not drawn

Per the spec's v1 scope: no map traversal, no accounts, no persistent chat, no eyewear / back items / pets, no duplicate-scan prevention. The "offline first-ever scan" state was also skipped this pass.
