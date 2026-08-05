<!-- WORKING DRAFT — iterating with Justin. Not canon. Status: draft.
     Purpose: screen map for the Seven Stars collection game (PWA).
     The clickable prototype is festival-game-v1.html. This file is the index + decisions log. -->

# Field App — Screen Map v3

Storyboard for the D.I.V. collection game. Open `festival-game-v1.html` to tap through it.

24 screens, 5 flows. Wireframe fidelity — item art is emoji placeholders, structure and copy are real.

## The two-tier model

This is the spine of the whole design.

**Everyone signs up the same way.** Sticker, NFC trinket, or a card — every path runs the same three-question reading and lands on a working badge. You are a real agent immediately: you collect, you draw lines, you visit HQ. You are also **unassigned**, with a generated name and an em dash where a designation code should be.

**An assignment card is the only way to get a post.** Scanning one registers you: you get a designation from the deck, its Object, a standing assignment, and the right to file your own name. Anonymous → registered.

Why it works:

- The card stops being an entry point and becomes an **event** — it can land an hour or two days after sign-up, and the longer the wait the bigger it plays.
- The gap is visible from the first screen. `PROVISIONAL · UNASSIGNED` and an amber *no post on file* block sit exactly where a registered agent's assignment goes, so people can see what they're missing before anyone explains it.
- The only route forward is a conversation with a person in a purple vest. *"Assignments are issued by hand, in the field."*
- It **deletes the hardest unbuilt piece.** The quiz no longer has to map onto the 16 designations, so there are no 16 answer-pairs left to author. The three questions go back to doing exactly what the original spec said: frequency, status, tool.

Put `a5` and `b4` side by side in the prototype's rail — the diff between those two screens is the entire pitch for the assignment card.

## Flows

**A · Sign-up — everyone** (sticker, trinket, or a first card)
`a1` cold open → `a2` frequency → `a3` status → `a4` tool → lands on `c1`

Four taps. There's no separate "badge issued" beat — the quiz drops you straight onto your home screen, so the badge feels like something you have rather than a prize you were handed. The install prompt moved there as a dismissible first-visit banner.

**B · Assignment card** (any time after sign-up — the big moment)
`b1` card recognized → `b2` file a name → `b3` the post → `b4` badge (registered)

`b1` forks: *an agent handed me this* → induction, *it's someone else's* → draws a line (`c5`).

**Core loop**
`c1` home unassigned · `c2` home registered · `c3` locker · `c4` new item · `c5` line drawn · `c6` lines · `c7` lines reconciled

**HQ** (needs a connection)
`h1` check-in → `h2` board → `h3` another agent's card · `h4` standings · `h5` envelope → `h6` mystery item

**Edge states**
`e1` already collected · `e2` unknown code · `e3` HQ unreachable

## Lines — the connection mechanic

**Scanning another agent's assignment card draws a line.** Not a squad, not a friends list. Their card code is already in your bundled lookup table, so offline your app learns *which post they hold* — a Mentor, a Spark — but not who they are. That's the Grid recording functions, not identities.

- **The first card you claim is yours; every card after that draws a line.** `b1` asks once — that single question is how the app tells "my card" from "your card" with no server and no identity. Once you hold a post there's no question at all, because a second card can never reassign you.
- **Second cards are purely additive:** an item, a line, a constellation slot. `c5` says `🎖 Post unchanged` out loud so nobody hesitates to scan a friend's card.
- **You also receive the item their card grants**, so people's cards are walking item sources. No new rules — that's already how the code table works.
- **`c6` is a constellation of the 16 posts**, filling in as you meet them. The Grid is organized by constellations, so this isn't decoration, it's the cosmology. Unmet posts are faint unlabelled dots.
- **It cannot be completed alone.** Objects fill your badge; people fill your constellation. Nobody gets to sixteen at their own tent.
- **Names arrive later, at HQ** (`c7`). Whether a card was already redeemed is invisible offline — that state lives on its owner's phone. But the app doesn't need it: offline you learn the **post** from the card code, and on your next check-in the **name** resolves. A claimed card's code is published alongside its owner's check-in, your device sends up the codes it has logged, and names come back. No new backend — it's the same shared store the board already uses. Resolved names cache locally and read as people forever after.
- **A line to someone who never checks in stays a post.** That's a fine outcome, and quietly true to the setting: some encounters never get filed.
- **One-way by default**, with a nudge: *"A line runs one way until both ends are spliced. Hand them your card."* Two phones, two cards, both credited, still no server.
- **Unassigned agents can draw lines too.** You don't need a post to meet people.
- Vocabulary comes from the deck: the Linkage Officer's reading is *"Every stranger is a line waiting to be drawn."*

**Home always gives you a job.** Registered agents get their standing assignment — the deck's own line for their designation. Everyone gets two orders: one sends you hunting objects (*find three more traces*, covering stickers and trinkets without naming either), one sends you at people (*draw a line to another agent*). The orders block is the door to your constellation.

## Decisions locked

- **The app is D.I.V.** `b3` uses the deck's own words so the app and printed cards can't drift.
- **Everyone takes the quiz; only cards assign posts.** The quiz sets aura tint, status and starter item — nothing more.
- **Anonymous by default.** Generated name at sign-up; filing your own name is a privilege the card unlocks.
- **Objects come from cards, not codes.**
- **Newest item auto-equips**, and the locker exists to undo that.
- **Count only, no locked silhouettes.** 34 pips, most of them dark.
- **Badge is home, HQ is a door.** No tab bar — the app should read as an issued credential, not software.
- **Graphics over text.** Composed avatars, 2×2 icon option grids, progress as pips, badge fields as icon chips, paragraphs demoted to chips.

## Open questions

Each screen carries its own in the prototype's notes panel. The ones that change the most downstream:

- `c6` — filling all 16 posts should mean *something*. What? It's the one reward in the app that would be genuinely hard to earn.
- `b1` — should claiming a card be irreversible? Currently yes; a mis-tap gives you the wrong post forever. ("The Grid doesn't deal a wrong card" is a fine in-universe answer.)
- `c7` — should reconciliation be announced like this, or silent (names just appear in `c6`)? Announced is a better moment; silent is less interruptive when you only came to see the board.
- `c7` — there's no way to drop a line once someone resolves into a person. Leave it that way?
- `c5` — one-way lines, or only count once both people have scanned each other? One-way is kinder to shy people; mutual is a better story.
- `c5` — an unassigned agent has no card to hand back. Does the nudge change for them?
- `h2` / `h3` — should unassigned show on the HQ board? Strong social pull toward getting a post, mild exclusion.
- `c1` — should the unassigned home say outright *find an agent in a purple vest*, or is the current phrasing enough?
- `c2` — role-specific orders (a Pathfinder told to survey north camp)? Much better flavour, 16× the copy.
- `h4` — should standings rank lines drawn as well as items held? It drives the behaviour, but ranking connection cuts against the spirit.
- `h1` — check-in TTL of 4h vs 6h. 4h is a genuinely "right now" board; 6h survives a nap.
- `a5` — is 34 the right advertised total? A visible denominator makes completion feel finite.
- `h6` — should the mystery item be visible to others at HQ (spreads the secret) or private (protects it)?

## Not drawn

Per the spec's v1 scope: no map traversal, no accounts, no persistent chat, no eyewear / back items / pets, no duplicate-scan prevention. Still undrawn: the offline first-ever scan, and a registered agent scanning a second assignment card.
