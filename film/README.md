# A Higher Frequency

The Vibe Corp recruitment film — a 60-second mid-century informational film, built in [Remotion](https://remotion.dev). First post for @vibecorp.live.

Black and white, grain, gate weave, flicker, iris transitions. Everything is drawn: a 1950s limited-animation crew member and cast, isotype diagrams, a spinning newspaper, a conveyor belt that won't stop. A generated pocket-orchestra cue with a theremin, synthesized foley, and an ElevenLabs narrator carry the sound.

## Run it

```sh
npm install
# the audio is generated, not committed — make it once before rendering:
npm run music            # regenerate public/music.wav (python3 + numpy)
npm run sfx              # regenerate public/sfx/*.wav
npm run voice            # ElevenLabs narration -> public/narration.wav (needs ELEVENLABS_API_KEY)
npm run studio           # scrub and tweak in the browser
npm run render           # out/a-higher-frequency.mp4        (1080×1350, 4:5 feed)
npm run render:vertical  # out/a-higher-frequency-9x16.mp4   (1080×1920, Reels)
```

`remotion.config.ts` points at the pre-installed headless Chromium; delete that line to let Remotion fetch its own.

## Where things live

- `src/copy.ts` — every word, every scene boundary, every story beat. Edit copy and timing here.
- `src/scenes/` — `opening` (leader, title, history pan), `middle` (crowd, assessment, cosmos), `montage` (headline, calibration, conveyor), `closing` (searchlight, join, requirements, radar, end card).
- `src/toon.tsx` — the cartoon rig: crew member and dancers, poses, dance and walk cycles. Check poses in the `Lab` composition.
- `src/look.tsx` — fonts, the mark, the projector (grain, weave, scratches), iris, subtitles.
- `src/Film.tsx` — sequencing, music, narration, foley cues.
- `scripts/music.py`, `scripts/sfx.py`, `scripts/voice.mjs` — the sound.

## The narrator

`npm run voice` voices each `NARRATION` line from `copy.ts` with ElevenLabs, nudges any take that overruns its slot (up to 12% faster, and warns past that), gives it a band-limited broadcast tone, writes `public/narration.wav`, and flips `src/voice.json` so the next render uses it and ducks the music. Takes are cached by text, so editing one line re-voices one line.

The network policy needs `api.elevenlabs.io` allowed, and the key set as `ELEVENLABS_API_KEY`. Pick a different voice with `ELEVENLABS_VOICE_ID`.

## Footage

Any scene key in `SCENES` can be swapped for a clip in `public/` via props — it gets the same projector treatment:

```sh
npx remotion render src/index.ts HigherFrequency out/film.mp4 --props='{"subtitles":true,"narration":null,"footage":{"us":"crowd.mp4"}}'
```
