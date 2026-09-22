# CLAUDE.md: vibecorp.live

Read the root `CLAUDE.md` first: tone, the two registers, Seven, and lore minimalism all apply here. This file covers what's specific to the site. `README.md` covers how it's built and run.

## What the site is for

The site is the **depth** register. Someone typed a URL off a slip or a card, and this page rewards them for leaning in. The site is sincere, quiet, and a little uncanny. It is not a landing page. It never explains the universe, never sells, and never winks.

The feeling to protect: *you've tuned into a channel that was already running, and it noticed you.*

## Decisions that are settled (don't undo without asking Justin)

- **One page, text-adventure shape.** Two to four lines of prose, then two to four choices. Tapping only; the card code is the one thing anyone types. No nav bar, no back button. The mark top left always goes home.
- **Home copy is "Signal detected."** It opens with "Signal detected," then "Faint, but it's there. Something about you registered on the Grid. How did you find us?" The three ways in are *Someone handed me a card / Someone took my reading / I'm not sure*.
- **The site can suggest a post; only the card confirms one.** A calibration gives a *leaning*: a faded card marked "unconfirmed," with the assignments to carry for now. "The Grid confirms a post in person." Never let the site hand out a real post.
- **Card-holder depth.** *Read the card closer* is only for people who entered a card. It shows a portrait (in the field / on the Grid / when it gets heavy / often found near) and then the **wisdom root**. The printed card never names the root; the site is where it gets named, framed as older listeners who heard the post first.
- **Lore is open to everyone.** *Who's on the other end?* (for card or reading holders) and *I'm not sure* (for first-timers) lead to the same rooms. How a room ends depends on what's on file. Only people with nothing on file are offered a reading.
- **Memory is per device, and forgettable.** `{ card, leaning, listened }` in localStorage. Every end state offers "Let the channel forget me."
- **Timeless.** The site is always open, with no dusk gating and no festival-only copy. Say *today*, not *tonight*. It has to work in March, from a couch.
- **Randomness is texture, never facts.** A post, its assignments, a leaning and today's reading never change on refresh. Return greetings, tuning labels, the rare "Did you hear that?" (~4%), and the Hz surge are random.
- **Cut on purpose:** a waveform in the header (distracting), overheard radio chatter (shifted the layout and didn't land), a past-crew log (confusing), and "just let it play" (duplicated the lore rooms). Don't bring them back without asking.

## Guardrails

- **Seven never appears on the site.** No rare line, reading or room may be signed, attributed, or read as "from Seven." Rare moments are unsigned and unexplained.
- **HQ stays open.** "The line runs a long way back." Wind. Never answer who's in charge.
- **No tracking.** No analytics, no counts of visitors or card holders, no backend. That was considered and declined.
- **Copy rules for new lines.** Short sentences. Present tense. Plain words over clever ones. It should pass the root CLAUDE.md sniff test: would someone who actually works the Grid say it this way?

## Craft bar

This has to feel great on a phone at a festival: bright sun or pitch dark, one hand, bad signal.

- Typing runs at 90 chars/s, with small pauses after punctuation, and a tap anywhere skips it. Nobody should ever wait on text. (120 felt a touch too fast.)
- A first visit opens on five slow dots before "Signal detected." Return visits skip them.
- **The meter is an instrument, not a readout.** Everything it does lives in `src/meter/patch.ts`, built from the waves in `waves.ts`. That covers the resting wobble, the dusk peak, strengthening over time on the page, presence, each post's temperament and dot colour, the Oracle's hunch, and the surge, dropout and tap-to-calibrate episodes. Keep new touches subtle and in the patch. The dot breathes smoothly on an oscillator; hard steps read as a stuttering frame rate. The typing caret still blinks hard, like a real cursor.
- **Avoid on the meter:** landing on or holding 7.77, or anything else that reads as a Seven sign. A waveform graphic was also cut.
- Haptics: a tick on each pick, and a light tick per word as text types. Android uses `navigator.vibrate`. iPhone has no web haptics API, so `haptics.ts` toggles a fresh hidden `<input switch>`, which plays the system tick on iOS 18+. This is best-effort: iOS may ignore ticks not directly from a tap, and none play with System Haptics off. Nothing fires before the first touch.
- Lines are laid out whole before they type, so words never jump lines. The caret takes no width.
- There are no spinners. The tuning bar is the loader.
- Nothing shifts the layout after it appears. If you add a block, reserve its space.
- Respect `prefers-reduced-motion`. It turns off all animation and typing.
- Before pushing, check at 375px wide. Nothing may scroll sideways (a long tuning label once did).

## Working here

- Edit copy in `src/screens.ts` or `src/content.ts`. Card facts come from `card-studio/deck`: change them there and run `npm run sync`. Never hand-edit `src/deck.json`.
- Check changes in the browser (`npm run dev`, or the `site` entry in `.claude/launch.json`). A hidden preview pane pauses `requestAnimationFrame`, so typing looks stalled there. That's the pane, not the site.
- `npm run build` must pass before pushing, because **pushing to main deploys to vibecorp.live.**
- Another session owns `public/favicon.svg` and `public/apple-touch-icon.png` (generated by `card-studio/scripts/export-brand.mjs`). Leave them to it.
