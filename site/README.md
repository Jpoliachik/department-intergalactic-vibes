# vibecorp.live

The channel. The URL printed on inspection reports and field specialty cards. There is one page, which feels like tuning into a radio channel that was already running. There's no pitch and no About page. You land on "Signal detected," and a handful of choices lead you in.

It's built with Vite and vanilla TypeScript and has no framework. The output is static files, and it deploys to Vercel.

## Run it

```bash
cd site
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then build to dist/
npm run sync       # after changing anything in card-studio/deck
```

Hidden hooks for testing on a real phone. Add one to any URL:

| Hook | Does |
| --- | --- |
| `#forget` | Clears what this device remembers and starts fresh |
| `#spike`, `#dropout`, `#calibrate` | Runs that meter episode a second after load |
| `#rare` | Shows "Did you hear that?" on the next screen that can have it |

## The flow

Everyone lands on **Signal detected. How did you find us?** From there:

- **Someone handed me a card.** They enter the code from the card's top corner (`GT-01`, and `gt01` works too). The **tuning** bar runs while the card's art downloads, then **We have you on file** and the post hub:
  - Your assignments
  - Today's reading: each post walks its own shuffle of the lines, one step per day, so it never repeats the next day and every line comes round before any returns
  - Read the card closer (a portrait of the post, then the wisdom it's rooted in)
  - Who's on the other end?
- **Someone took my reading.** Three tap-to-answer calibration questions, then **Your signal leans toward…** a faded, unconfirmed card. A leaning is not a post: only the physical card confirms one.
- **I'm not sure.** The lore rooms: Vibe Corp, the channel, the Grid, the crew, HQ, and wind. They end at **Keep listening. Someone may hand you something.**

Every path ends somewhere the device remembers, and a return visit picks up there. The mark top left always goes home. Every end state has **Let the channel forget me**.

`vibecorp.live/GT-01` (any card code as the path) skips straight to tuning that code. Unknown paths get an in-world 404.

## Where things live

| File | What's in it |
| --- | --- |
| `src/screens.ts` | Every screen and choice, in the order a visitor meets them. Most copy edits happen here. |
| `src/content.ts` | Site-only copy that isn't a single screen: daily readings, return greetings, tuning labels, rare lines, calibration questions, and each post's portrait and wisdom root. |
| `src/engine.ts` | How screens play: typing, skip, transitions, choices, the code field, the tuning bar. |
| `src/deck.json` | **Generated.** Card facts from `card-studio/deck`. Don't hand-edit it; run `npm run sync`. |
| `src/deck.ts` | Lookups over the deck, the card-art `<picture>`, and preloading it. |
| `src/brand/` | **Generated.** Copies of `brand/mark/glyph.svg` (injected into both pages at build) and `brand/tokens.css` (imported by the CSS). |
| `src/state.ts` | What the device remembers: `{ card?, leaning?, listened? }` in localStorage. |
| `src/meter/patch.ts` | **The meter's design.** What the Hz number and the live dot do at rest, per post, and in each episode. Play here. |
| `src/meter/waves.ts` | The toolkit the patch composes: `sine`, `breath`, `noise`, `jitter`, `oscillator`, `sum`, `scale`, `settle`… |
| `src/meter/meter.ts` | The runtime that plays the patch. You shouldn't need to touch it. |
| `src/haptics.ts` | Ticks on picks and typing: `navigator.vibrate` on Android, a hidden switch toggle on iOS 18+ (best-effort). |
| `src/style.css` | All styling. One dark look, on purpose. |
| `scripts/sync-deck.mjs` | Deck → `deck.json`, card art → `public/cards/`, fonts → `public/fonts/`, and the brand glyph and tokens → `src/brand/`. |
| `scripts/og.mjs` | Renders `public/og.png` (the link preview) in real Plex Mono using card-studio's puppeteer. |
| `public/favicon.svg`, `public/apple-touch-icon.png` | **Generated** by `card-studio/scripts/export-brand.mjs`, not by this folder. |

## The meter

The reading in the header is a small instrument. `meter/patch.ts` describes it as four channels:

- **`hz`:** the number.
- **`glow`:** the dot's brightness, 0–1.
- **`size`:** the dot's scale.
- **`dot`:** the dot's colour, a brand band.

Each channel is built from **waves** in `meter/waves.ts`, which are small functions of the current moment. The moment includes seconds on the page, the local hour, recent presence (0–1), the post on file, and seconds until the next episode.

- **At rest:** the number is 7.83 plus a sum of influences:
  - the post's temperament
  - a dusk peak
  - a slow strengthening the longer someone stays
  - presence
  - the Oracle's hunch before a surge

  The dot breathes on an `oscillator` whose speed rises with presence and glides rather than jumps.
- **Temperaments:** each post can set its own `hz` wave, breathing `beat` and `dot` colour. The Anchor barely moves, the Wanderer drifts on smooth noise, the Pulse keeps a beat, and the Deep Diver runs low.
- **Episodes:** anomalies that override any channel for a few seconds. Each is drawn from progress `k` (0→1). There are three:
  - `spike`: the red surge
  - `dropout`: signal lost
  - `calibrate`: tapping the meter

  `SCHEDULE` sets when the automatic ones come: the first at 20–40s, then every 45–120s.
- **Presence:** comes in through `meter.nudge("type" | "pick" | "tap")` and halves every 2.5s.

The dot is redrawn every frame. The number redraws at `cadence`: 1.4s at rest, faster while someone's present or an episode runs. Nothing runs while the tab is hidden, and with reduced motion the dot holds still.

To add a touch, add a wave to `hz`, a field to a temperament, or an entry to `EPISODES`. The runtime picks it up. One rule: an `oscillator` keeps its own phase, so evaluate each one exactly once per frame.

## Deploying

The Vercel project is `vibecorp`, with root directory `site/`. **Pushing to `main` deploys to production.** Vercel skips the build when nothing in `site/` changed. Run `npm run build` before pushing; a failed build leaves the previous deploy live.

`vercel.json` pins the Vite preset and rewrites `/XX-00`-shaped paths to the channel. It caches `/assets` and `/cards` immutably for a year, which is safe because their names are content-hashed. Fonts have fixed names, so they're cached for 30 days instead.

## Performance notes

- The app is about 15KB of gzipped JS. Most of that is copy.
- Card art is AVIF (WebP fallback) at 440 and 880px, roughly 20–100KB per card. Only the card being shown is fetched.
- Only Plex 400, the first screen's face, is preloaded. The other three faces load while the tuning bar runs, so nothing re-lays out mid-type. All fonts use `font-display: swap`.
- There are no spinners. The tuning bar is the loader: it runs at least 1.4s, waits for the art to decode (8s at most), then completes. On a slow connection it just reads as a weak signal.
- There's no analytics, no backend, no cookies, and no accounts.
