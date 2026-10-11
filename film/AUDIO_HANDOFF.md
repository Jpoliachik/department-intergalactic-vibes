# Audio handoff: voiceover and music

**For:** the session holding the ElevenLabs key.
**Branch:** `film/a-higher-frequency`. Work on it directly and push to it.
**Film:** `film/`. It's a 60-second Remotion film. The picture is finished, and the narration currently shows as subtitles.

Read `film/README.md` first (five minutes). This file covers only the sound.

---

## 0. Setup

```sh
git fetch origin film/a-higher-frequency && git checkout film/a-higher-frequency
cd film
npm install
npm run music   # the generated score   -> public/music.wav
npm run sfx     # the generated foley   -> public/sfx/*.wav
```

You need `ELEVENLABS_API_KEY` set, and the environment's network policy must allow `api.elevenlabs.io`. If a request is refused before it reaches ElevenLabs, the domain isn't allowed yet.

Requirements: Node 22, python3 with numpy, ffmpeg, and Chromium. Remotion is configured to use `/opt/pw-browsers/...` in `remotion.config.ts`. If that path doesn't exist on your machine, delete the `setBrowserExecutable` line.

---

## 1. The voiceover (the main job)

```sh
npm run voice
```

`scripts/voice.mjs` reads every line from `src/copy.ts` → `NARRATION`. It does the following:

- **Voices each line** separately, passing the neighbouring lines as context so the delivery flows.
- **Fits each take into its time slot.** A take that runs long is sped up by at most 12%; past that, the script prints a warning.
- **Adds a mid-century broadcast sound:** band-limited, lightly compressed, with a small room.
- **Writes the result** to `public/narration.wav` (exactly 60.0 s).
- **Switches the film over** by writing `src/voice.json`. Renders then use the voice and lower the music under it automatically. The subtitles stay on, because most people watch with the sound off.

Takes are cached in `public/voice/` by voice + model + text, so re-running only pays for lines that changed. `VOICE_FRESH=1` re-voices everything.

### Casting

The brief: **"warm, mid-century, utterly certain."** Think of the narrator of a 1950s Encyclopaedia Britannica or Bell Labs educational film. He's friendly, reassuring, and completely sure of himself, and he never winks at the audience. The comedy works only if he plays it straight.

- The default is `ELEVENLABS_VOICE_ID=pqHfZKP75CvOlQylNhV4` ("Bill", a premade older American voice). **This ID hasn't been verified**, because the first session couldn't reach the API.
  - List the account's voices with `GET /v1/voices`.
  - Audition two or three candidates on line 1 and line 11, then pick one.
  - A deep, warm, older American male narrator is the target. A transatlantic accent is a bonus.
- The model defaults to `eleven_multilingual_v2`; override it with `ELEVENLABS_MODEL`.
- The voice settings are in `voice.mjs`: stability 0.6, similarity 0.8, style 0.3. Raise stability if takes wander.

### The lines and their slots

Each line has to finish inside its slot, because the picture is cut to these times.

| # | starts | slot | line | lands on screen as |
|---|---|---|---|---|
| 1 | 5.0 | 4.9s | For as long as anyone can remember, someone has been watching the vibes. | history pan: cave → vase → jazz club |
| 2 | 11.6 | 3.0s | That someone is us. | crew member tips their hat at **12.0** |
| 3 | 15.5 | 4.3s | At VibeCorp's Department of Vibe Assessment, | assessor and dancer |
| 4 | 20.0 | 5.0s | our officers monitor the universe's frequencies — so you don't have to. | "so you don't have to" should land around **23.3** (cut to the moon) |
| 5 | 25.5 | 4.4s | Every day, thousands of assessments. Calibrations. Readings. | "Readings" around **29.0** |
| 6 | 30.2 | 4.4s | The work is vital. The work is endless. | "endless" around **32.6**, when the belt starts speeding up |
| 7 | 35.4 | 3.0s | And we are always looking for more. | searchlight sweeps |
| 8 | 38.6 | 3.2s | Individuals of rare frequency. People with good vibes. | the light finds someone on its first word |
| 9 | 43.6 | 5.0s | Requirements are simple: a steady pulse, a discerning eye, and no fear of the hum. | icons pop at **45.3 / 46.5 / 47.6** |
| 10 | 49.0 | 4.6s | If your frequency is true — we will find you. | radar locks at **51.6** on "find you" |
| 11 | 54.6 | 3.2s | VibeCorp. Your frequency has already been logged. | stamp slams at **57.0** on "logged" |

The bold times are `BEATS` in `src/copy.ts`.

If a take's phrasing pushes a key word off its beat, there are two fixes:
- Nudge that line's `from` in `NARRATION`. This is cheap.
- If a beat should move instead, change it in `BEATS`. The picture, the foley and the subtitles all follow `BEATS`. The score does not: cue times in `scripts/music.py` are hard-coded and would need moving by hand.

**Don't edit the wording.** The script is the client's, and they asked for it verbatim. If the voice stumbles on "VibeCorp", spell it out phonetically in the text you send to the API, not in `copy.ts`.

### Checking it

Listen to the full mix, not just the narration track:

```sh
npm run render                 # out/a-higher-frequency.mp4 (4:5)
npm run render:vertical        # out/a-higher-frequency-9x16.mp4
```

Things to check:
- Narration peaks around -16 LUFS, and the music sits clearly under it.
- No line is clipped at its end.
- Line 1 doesn't run into the "That someone is us" hat tip.

---

## 2. Music: optional, and only if it hits the cues

There is already a score. `scripts/music.py` generates a cheerful pocket orchestra with a theremin underneath, cut to the picture. Keep it unless ElevenLabs Music can do clearly better **and** hit the cues.

If you try ElevenLabs Music:
- **Brief:** a 1950s educational-film score. Cheerful light orchestra (pizzicato strings, muted brass, tuba oom-pah, glockenspiel) with a theremin underneath, not on top. Mono, a little band-limited, like an optical soundtrack. 120 bpm. Instrumental only.
- **Output:** write it to `public/music.wav`, 44.1 kHz, exactly 60.0 s. The film plays that file and nothing else for music.
- **It must hit these points** (seconds):

| t | cue |
|---|---|
| 0.2–1.4 | timpani roll under the countdown leader |
| **1.4** | brass chord + glock on the VIBECORP logo |
| 2–10 | stately title theme |
| 10–32.6 | bouncy main theme (oom-pah, pizzicato) |
| **32.6–34.55** | "the work is endless": a figure that keeps speeding up and climbing |
| **34.55–35.0** | tape-stop: everything slows to nothing |
| **35.0** | soft, searching, night sky; theremin alone up top |
| **38.6** | theremin swoops up when the searchlight finds someone |
| **42.0** | sting (brass stab, timpani, crash) on JOIN THE MOVEMENT |
| 42–54 | proud march with snare |
| **54.0** | big final chord, held, gone by **57.95** |
| 57.95–58.5 | silence |
| **58.5** | a short, satisfied staccato button |

A realistic route: generate sections separately and assemble them with ffmpeg on those boundaries. Or keep the generated score and use ElevenLabs only to replace weak layers.

## 3. Sound effects: optional

These are already synthesized by `scripts/sfx.py` and cued in `src/Film.tsx` → `useFoley`:

- countdown beep
- whooshes on the history pans, cosmos and headline
- thunks on the newspaper landing and on every slip the belt stamps (computed from the belt's motion)
- dings on the hat tip and the assessor's tick
- chime on the found candidate
- heartbeat, monocle tink and transformer hum on the requirements
- radar pings
- the final stamp
- a quiet projector rattle under everything

To upgrade one with the ElevenLabs Sound Effects API, write it over the same filename in `public/sfx/`. The cues and volumes stay as they are. Keep each effect short and dry; the projector chain adds the age.

---

## 4. Committing

Generated audio is gitignored, except for the narration:
- `public/voice/` and `public/narration.wav` are paid-for takes, so **commit them** along with `src/voice.json`. Then any session can render with the voice without spending credits.
- If you replace the music with ElevenLabs output, commit it too: add `!public/music.wav` to `film/.gitignore`, because it can't be regenerated.

Commit to `film/a-higher-frequency` and push. Don't push to `main`, because pushes to `main` deploy the site.

## 5. Don't touch

- **The purple.** Purple marks Vibe Corp and nothing else (see README).
- **The wording** in `NARRATION`.
- **The picture**, unless a beat has to move for the voice (see §1).

---

## 6. Faster takes for the 30-second cut

The 30s cut (`npm run cut`) time-stretches the 60s takes to about 1.47×, which can sound processed. A faster read sounds better:

```sh
VOICE_FOR=cut30 npm run voice   # Adam, same settings, ElevenLabs speed 1.2 -> public/voice/cut30/
npm run cut                     # picks those takes up, re-solves the pace (~1.2x), re-anchors every beat
npm run render:30 && npm run render:30:vertical
```

The 60s narration is left alone. Commit `public/voice/cut30/` and push.
