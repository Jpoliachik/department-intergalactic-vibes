// Narration via ElevenLabs.
//
// Reads every line from src/copy.ts → NARRATION, voices each one, fits it into
// its slot, gives it a mid-century broadcast tone, and lays the lot onto a
// single 60 s track at public/narration.wav. Then flips src/voice.json so the
// film uses it.
//
//   ELEVENLABS_API_KEY=... node scripts/voice.mjs
//
// Options (env):
//   ELEVENLABS_VOICE_ID   voice to use (default: a warm, older American narrator)
//   ELEVENLABS_MODEL      default eleven_multilingual_v2
//   VOICE_FRESH=1         ignore the cache and re-voice every line
//
// Lines are cached in public/voice/ by a hash of (voice, model, text), so
// re-running after a copy edit only pays for the lines that changed.

import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? 'pqHfZKP75CvOlQylNhV4'; // "Bill" — premade, older, trustworthy
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
const FRESH = process.env.VOICE_FRESH === '1';
const DURATION = 60;

if (!KEY) {
	console.error('ELEVENLABS_API_KEY is not set. Add it to the environment and run again.');
	process.exit(1);
}

// --- the lines, straight from copy.ts
const copy = readFileSync(join(root, 'src/copy.ts'), 'utf8');
const block = copy.slice(copy.indexOf('export const NARRATION'), copy.indexOf('];', copy.indexOf('export const NARRATION')));
const lines = [...block.matchAll(/\{from:\s*([\d.]+),\s*to:\s*([\d.]+),\s*text:\s*('(?:[^'\\]|\\.)*')\}/g)].map((m) => ({
	from: Number(m[1]),
	to: Number(m[2]),
	// the literal is a plain single-quoted string with \u escapes
	text: new Function(`return ${m[3]}`)(),
}));
if (!lines.length) throw new Error('No NARRATION lines found in src/copy.ts');

const dir = join(root, 'public/voice');
mkdirSync(dir, {recursive: true});

const probe = (file) =>
	Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

// --- voice each line
const takes = [];
for (const [i, line] of lines.entries()) {
	const id = createHash('sha1').update(`${VOICE}|${MODEL}|${line.text}`).digest('hex').slice(0, 10);
	const file = join(dir, `${String(i).padStart(2, '0')}-${id}.mp3`);
	if (FRESH || !existsSync(file)) {
		process.stdout.write(`voicing ${i + 1}/${lines.length}: ${line.text}\n`);
		const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
			method: 'POST',
			headers: {'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg'},
			body: JSON.stringify({
				text: line.text,
				model_id: MODEL,
				previous_text: lines[i - 1]?.text,
				next_text: lines[i + 1]?.text,
				// steady and certain, with a little warmth
				voice_settings: {stability: 0.6, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true},
			}),
		});
		if (!res.ok) {
			console.error(`ElevenLabs said ${res.status}: ${await res.text()}`);
			process.exit(1);
		}
		writeFileSync(file, Buffer.from(await res.arrayBuffer()));
	} else {
		process.stdout.write(`cached  ${i + 1}/${lines.length}\n`);
	}
	const dur = probe(file);
	const slot = line.to - line.from;
	// speed up slightly if a take overruns its slot; never more than 12%
	const tempo = dur > slot ? Math.min(1.12, dur / slot) : 1;
	if (dur / tempo > slot + 0.05) console.warn(`  ! line ${i + 1} runs ${(dur / tempo - slot).toFixed(2)}s long — shorten it or widen its slot in copy.ts`);
	takes.push({file, at: line.from, tempo});
}

// --- lay them down, then the broadcast chain: band-limited, a touch of tube, a small room
const inputs = takes.flatMap((t) => ['-i', t.file]);
const chains = takes.map((t, i) => `[${i}:a]aresample=44100,atempo=${t.tempo.toFixed(4)},adelay=${Math.round(t.at * 1000)}:all=1[v${i}]`);
const mix = `${takes.map((_, i) => `[v${i}]`).join('')}amix=inputs=${takes.length}:normalize=0[mix]`;
const tone =
	'[mix]highpass=f=160,lowpass=f=5200,equalizer=f=2400:t=q:w=1.2:g=3,' +
	'acompressor=threshold=-20dB:ratio=3:attack=8:release=120,' +
	'aecho=0.8:0.5:28:0.12,' +
	`apad,atrim=0:${DURATION},loudnorm=I=-16:TP=-1.5[out]`;
const out = join(root, 'public/narration.wav');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', [...chains, mix, tone].join(';'), '-map', '[out]', '-ac', '1', '-ar', '44100', out]);

writeFileSync(join(root, 'src/voice.json'), JSON.stringify({narration: 'narration.wav'}, null, '\t') + '\n');
console.log(`\nwrote public/narration.wav (${probe(out).toFixed(1)}s) and switched the film to it. Now: npm run render`);
