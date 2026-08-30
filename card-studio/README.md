# Vibe Corp Card Studio

A tiny local web app for viewing and iterating on the **Vibe Corp** Field
Specialty deck — the 16 cards defined in the
repo's [`ASSIGNMENTS.md`](../ASSIGNMENTS.md).

For each card you can see the composited card face, **regenerate** the art
(Nano Banana / Gemini) and the text (tagline + assignment, via Claude), and
view/edit every piece — bio, scene story, and metadata.
Everything is stored as files under [`deck/`](deck/) and committed to git, so you
use `git commit` to "save" a set you like and `git checkout` to go back.

## What's where

```
deck/
  globals.json            # the three generation prompt templates + model ids
  <slug>/card.json        # one per card: metadata, bio, scene story, tagline,
                          #   assignments
  <slug>/image.png        # the generated art (created on first generate)
app/                      # Next.js app + API routes
components/               # UI (shadcn/ui) + studio components
lib/                      # fs store, prompt interpolation, Anthropic + Gemini clients
scripts/seed-deck.mjs     # (re)seed the deck data; write-if-missing
```

## Setup

1. **Keys.** Copy the env template and add your two keys:

   ```bash
   cp .env.example .env.local
   ```

   - `ANTHROPIC_API_KEY` — taglines + assignments ([console](https://console.anthropic.com/settings/keys))
   - `GEMINI_API_KEY` — card art, "Nano Banana" ([AI Studio](https://aistudio.google.com/apikey))

   `.env.local` is gitignored; keys never get committed.

2. **Install + run:**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000.

The deck data is already seeded and committed. To recreate any missing files:
`node scripts/seed-deck.mjs` (add `FORCE=1` to overwrite existing ones).

## How it works

**Three global prompt templates** (edit them via the **Global prompts** button)
generate each content piece. They interpolate `{{variable}}` placeholders from
each card — `{{name}}`, `{{bio}}`, `{{sceneStory}}`, `{{object}}`, etc.:

- **Image prompt** — assembles the locked visual style + the card's scene story
  and bio, sent to Gemini `gemini-2.5-flash-image`.
- **Tagline prompt** — Claude writes the short tagline.
- **Assignment prompt** — Claude writes the two "Your Assignment" entries.

**Per card**, `bio` and `sceneStory` are the source you hand-edit; `tagline`
and `assignments` are generated outputs.

There is no per-card image prompt. The prompt sent to the image model is always
the global template with that card's variables filled in, rendered fresh at
generate time — so a change to the template applies to every card immediately,
with nothing stored per card to drift out of sync. The Edit panel shows the
resolved prompt read-only. To change the art direction, edit the template under
**Global prompts**; to change one card, edit its `bio` / `sceneStory`.

**Regenerating:** each card tile has Image / Tagline / Assignment buttons; the
Edit panel has the same plus full field editing. Editing a field and hitting a
regenerate button in the panel saves first, so generation uses your latest text.

**Saving sets you like:** it's just git.

```bash
git add card-studio/deck && git commit -m "deck: happy with this round"
```

Regenerate freely to explore; commit the keepers, `git checkout` to discard the
rest.

## Models

Defaults live in `deck/globals.json` (`textModel`, `imageModel`) and are editable
in the Global prompts → Models tab. Environment variables `TEXT_MODEL` /
`IMAGE_MODEL` override them if set.
