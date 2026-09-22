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
| `#spike` | Triggers the Hz surge a second after load |
| `#rare` | Shows "Did you hear that?" on the next screen that can have it |

## The flow

Everyone lands on **Signal detected. How did you find us?** From there:

- **Someone handed me a card.** They enter the code from the card's top corner (`GT-01`, and `gt01` works too). The **tuning** bar runs while the card's art downloads, then **We have you on file** and the post hub:
  - Your assignments
  - Today's reading (one line per post per day)
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
| `src/deck.ts` | Lookups over the deck, plus art preloading. |
| `src/state.ts` | What the device remembers: `{ card?, leaning?, listened? }` in localStorage. |
| `src/hz.ts` | The 7.83 Hz reading and its occasional surge. |
| `src/style.css` | All styling. One dark look, on purpose. |
| `scripts/sync-deck.mjs` | Deck → `deck.json`, card art → `public/cards/`, fonts → `public/fonts/`, `icon-512.png`. |
| `scripts/og.mjs` | Renders `public/og.png` (the link preview) in real Plex Mono using card-studio's puppeteer. |
| `public/favicon.svg`, `public/apple-touch-icon.png` | **Generated** by `card-studio/scripts/export-brand.mjs`, not by this folder. |

## Deploying

The Vercel project is `vibecorp`, with root directory `site/`. **Pushing to `main` deploys to production.** Vercel skips the build when nothing in `site/` changed. Run `npm run build` before pushing; a failed build leaves the previous deploy live.

`vercel.json` pins the Vite preset and rewrites `/XX-00`-shaped paths to the channel. It also caches `/assets`, `/cards` and `/fonts` immutably for a year. Card art and bundles have content-hashed names, so that's safe. **Fonts don't**: if you ever replace a font file, give it a new name.

## Performance notes

- The app is about 15KB of gzipped JS. Most of that is copy.
- Card art is AVIF (WebP fallback) at 440 and 880px, roughly 20–100KB per card. Only the card being shown is fetched.
- The two Plex weights used for body text are preloaded. All fonts use `font-display: swap`.
- There are no spinners. The tuning bar is the loader: it runs at least 1.4s, waits for the art to decode (8s at most), then completes. On a slow connection it just reads as a weak signal.
- There's no analytics, no backend, no cookies, and no accounts.
