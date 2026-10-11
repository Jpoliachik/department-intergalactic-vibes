import {Composition} from 'remotion';
import {DURATION_S, FPS} from './copy';
import {Film} from './Film';
import {Lab} from './Lab';
import {Vertical} from './Vertical';
// Written by scripts/voice.mjs once a narration track exists.
import voice from './voice.json';

export const Root: React.FC = () => (
	<>
		{/* 4:5 — the Instagram feed shape. */}
		<Composition
			id="HigherFrequency"
			component={Film}
			durationInFrames={DURATION_S * FPS}
			fps={FPS}
			width={1080}
			height={1350}
			defaultProps={{subtitles: true, narration: voice.narration, footage: {}}}
		/>
		{/* 9:16 — Reels / Stories: the same film, projected into a strip of film. */}
		<Composition
			id="HigherFrequencyVertical"
			component={Vertical}
			durationInFrames={DURATION_S * FPS}
			fps={FPS}
			width={1080}
			height={1920}
			defaultProps={{subtitles: true, narration: voice.narration, footage: {}}}
		/>
		<Composition id="Lab" component={Lab} durationInFrames={90} fps={FPS} width={1080} height={1350} />
	</>
);
