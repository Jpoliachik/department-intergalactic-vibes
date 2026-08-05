<!-- WORKING DRAFT — iterating with Justin. Not canon. Status: draft.
     Purpose: screen map for the Seven Stars collection game (PWA).
     The clickable prototype is festival-game-v1.html. This file is the index + decisions log. -->

# Field App — Screen Map v2

Storyboard for the D.I.V. collection game. Open `festival-game-v1.html` to tap through it.

22 screens, 5 flows. Wireframe fidelity — item art is emoji placeholders, structure and copy are real.

## Flows

**A · Assignment card** (physical card, handed over by an agent)
`a1` handoff → `a2` name → `a3` welcome → `a4` the turn → `a5` badge

**B · Anon QR** (sticker or found NFC trinket)
`b1` cold open → `b2` frequency → `b3` posture → `b4` tool → `b5` badge

**Core loop**
`c1` badge (home) · `c2` locker · `c3` new item

**HQ** (needs a connection)
`h1` check-in → `h2` board → `h3` another agent's card · `h4` standings · `h5` envelope → `h6` mystery item

**Edge states**
`e1` already collected · `e2` unknown code · `e3` HQ unreachable

## Changed in v2

- **Cut the anon name screen.** Q3 goes straight to the badge, which now reveals the generated name itself. Flow B is four taps from sticker to finished credential.
- **Added a welcome beat to flow A** (`a3`). The old single designation screen was carrying welcome + designation + assignment + reading + Object all at once. Now: welcome, then the turn.
- **Graphics carry the screens, not text.** Composed emoji avatars (hat + body + held item) instead of labelled boxes, 2×2 icon grids for quiz answers, progress as 34 pips instead of "7 / 34" prose, badge fields as icon chips, item icons in the locker and on other agents' cards.
- **Copy cut app-wide.** Most screens are down to one headline and at most one line. Explanatory paragraphs became chips: retention is `⏳ Ages off in 4h`, offline reassurance is `✅ Your badge still works`, Object issuance is `🔑 OBJECT ISSUED`.

Item art is emoji standing in for pixel sprites. Slots map cleanly: 🎩 hat, 👕 outfit, ✊ held item, ✨ aura tint, 🖼 backdrop.

## Decisions locked

- **The app is D.I.V., and the quiz is the draw.** Designations come from the 16 in `../ASSIGNMENTS.md`. `a4` uses the deck's own words so the app and printed cards can't drift.
- **Oblique questions, hidden mapping.** No menu of roles. Q2 (4 answers) × Q3 (4 answers) = exactly 16 cells, one per designation. Q1 sets aura tint only.
- **Objects come from cards, not codes.** Your designation's Object becomes your starter held item *only* on the card path. Anon players are told their Object exists and that an agent has to hand it over — the app drives people toward a human in a purple vest.
- **Newest item auto-equips**, and the locker exists to undo that.
- **Count only, no locked silhouettes.** 34 pips, most of them dark. The lineup stays unspoiled.
- **Badge is home, HQ is a door.** No tab bar — the app should read as an issued credential, not software.

## Open questions, by screen

Each screen carries its own in the prototype's notes panel. The ones that change the most downstream:

- `b3` / `b4` — which of the 16 answer-pairs maps to which designation. The obvious cells are easy; the quiet corners need care.
- `b5` — if an anon player later draws a card with a *different* designation: overwrite, keep the first, or dual posting?
- `b5` — without the standalone name screen, is the generated name still a moment? If it needs more, the fix is animation here rather than another screen.
- `a3` — should the anon path get a welcome too, or does card-only make cards more ceremonial?
- `a4` — the assignment is trimmed to one sentence; the printed card keeps both. Reward, or mismatch?
- `h1` — check-in TTL of 4h vs 6h. 4h is a genuinely "right now" board; 6h survives a nap.
- `h2` — board density past ~100 check-ins: cap at the 20 most recent, or let it fill up like a real bulletin board?
- `a5` — is 34 the right advertised total? A visible denominator makes completion feel finite.
- `h6` — should the mystery item be visible to others at HQ (spreads the secret) or private (protects it)?

## Not drawn

Per the spec's v1 scope: no map traversal, no accounts, no persistent chat, no eyewear / back items / pets, no duplicate-scan prevention. The "offline first-ever scan" state is also still undrawn.
