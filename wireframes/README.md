<!-- WORKING DRAFT — iterating with Justin. Not canon. Status: draft.
     Purpose: screen map for the Seven Stars collection game (PWA).
     The clickable prototype is festival-game-v1.html. This file is the index + decisions log. -->

# Field App — Screen Map v2

Storyboard for the D.I.V. collection game. Open `festival-game-v1.html` to tap through it.

23 screens, 5 flows. Wireframe fidelity — item art is emoji placeholders, structure and copy are real.

## Flows

**A · Assignment card** (physical card, handed over by an agent)
`a1` handoff → `a2` name → `a3` welcome + post → `a4` badge

**B · Anon QR** (sticker or found NFC trinket)
`b1` cold open → `b2` frequency → `b3` posture → `b4` tool → `b5` badge

**Core loop**
`c1` badge (home) · `c2` locker · `c3` new item · `c4` line drawn · `c5` lines

**HQ** (needs a connection)
`h1` check-in → `h2` board → `h3` another agent's card · `h4` standings · `h5` envelope → `h6` mystery item

**Edge states**
`e1` already collected · `e2` unknown code · `e3` HQ unreachable

## Changed in v2

- **Cut the anon name screen.** Q3 goes straight to the badge, which now reveals the generated name itself. Flow B is four taps from sticker to finished credential.
- **Flow A opens on a promise, not a description.** `a1` was restating what the player had just done ("this card was issued to you by hand"). Now: *"Your file was opened long before tonight."* Mystical headline, dry code underneath — that pairing is the tone formula.
- **`a2` establishes trust before asking for anything.** An agent vouched for you, and the post you were handed is a specific one. Canon, not flattery — Tier 3 induction in the README is explicitly the agent's judgement call.
- **Welcome and designation are one screen** (`a3`). What keeps it from scattering is weight, not word count: the greeting is eyebrow-sized, the Object art and designation are the hero, assignment and reading sit under a rule as body text.
- **Graphics carry the screens, not text.** Composed emoji avatars (hat + body + held item) instead of labelled boxes, 2×2 icon grids for quiz answers, progress as 34 pips instead of "7 / 34" prose, badge fields as icon chips, item icons in the locker and on other agents' cards.
- **Copy cut app-wide.** Most screens are down to one headline and at most one line. Explanatory paragraphs became chips: retention is `⏳ Ages off in 4h`, offline reassurance is `✅ Your badge still works`, Object issuance is `🔑 OBJECT ISSUED`.

Item art is emoji standing in for pixel sprites. Slots map cleanly: 🎩 hat, 👕 outfit, ✊ held item, ✨ aura tint, 🖼 backdrop.

## Lines — the connection mechanic (proposal)

**Scanning another agent's assignment card draws a line.** Not a squad, not a friends list. Their card code is already in your bundled lookup table, so offline your app learns *which post they hold* — a Mentor, a Spark — but not who they are. That's the Grid recording functions, not identities.

- **You also receive the item their card grants**, so people's cards are walking item sources. No new rules — that's already how the code table works.
- **`c5` is a constellation of the 16 posts**, filling in as you meet them. The Grid is organized by constellations, so this isn't decoration, it's the cosmology. Unmet posts are faint unlabelled dots.
- **It cannot be completed alone.** Nobody fills sixteen posts at their own tent. Objects fill your badge; people fill your constellation.
- **One-way by default**, with a nudge: *"A line runs one way until both ends are spliced. Hand them your card."* Two phones, two cards, both credited, still no server.
- **Names resolve later, if ever.** Offline you met a function. If you both check in at HQ, logged card codes can resolve into names — the file catches up.
- Vocabulary comes from the deck: the Linkage Officer's reading is *"Every stranger is a line waiting to be drawn."*

**Home always gives you a job** (`c1`, and `a4` at induction): your standing assignment — the deck's own line for your designation — plus two orders. One sends you hunting objects ("find three more traces", covering stickers and trinkets without naming either), one sends you at people ("draw a line to another agent"). The orders block is the door to your constellation.

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
- `a3` — now the longest screen in the app. If it crowds on a real phone, cut the field reading first: it's the line most likely to be read off the printed card instead.
- `a3` — should the anon path get a welcome too, or does card-only make cards more ceremonial?
- `a2` — does naming the agent land harder ("Agent Marlow vouched for you")? Needs the squad member's name on the card, which is a print-run decision.
- `c5` — filling all 16 posts should mean *something*. What? It's the one reward in the app that would be genuinely hard to earn.
- `c4` — should a line count one-way, or only once both people have scanned each other? One-way is kinder to shy people; mutual is a better story.
- `c1` — should orders be role-specific (a Pathfinder told to survey north camp, a Caretaker told to find someone fading)? Much better flavour, 16× the copy.
- `h4` — should standings rank by lines drawn as well as items held? Ranking connection cuts against the spirit, but it drives the behaviour.
- `h1` — check-in TTL of 4h vs 6h. 4h is a genuinely "right now" board; 6h survives a nap.
- `h2` — board density past ~100 check-ins: cap at the 20 most recent, or let it fill up like a real bulletin board?
- `a4` — is 34 the right advertised total? A visible denominator makes completion feel finite.
- `h6` — should the mystery item be visible to others at HQ (spreads the secret) or private (protects it)?

## Not drawn

Per the spec's v1 scope: no map traversal, no accounts, no persistent chat, no eyewear / back items / pets, no duplicate-scan prevention. The "offline first-ever scan" state is also still undrawn.
