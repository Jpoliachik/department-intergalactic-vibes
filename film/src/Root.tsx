import {Composition} from 'remotion';
import {CUTS} from './cuts';
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
		{/* 30s — the short cut, both shapes. */}
		<Composition
			id="HigherFrequency30"
			component={Film}
			durationInFrames={Math.round(CUTS.cut30.duration * FPS)}
			fps={FPS}
			width={1080}
			height={1350}
			defaultProps={{subtitles: true, narration: null, footage: {}, cut: 'cut30'}}
		/>
		<Composition
			id="HigherFrequency30Vertical"
			component={Vertical}
			durationInFrames={Math.round(CUTS.cut30.duration * FPS)}
			fps={FPS}
			width={1080}
			height={1920}
			defaultProps={{subtitles: true, narration: null, footage: {}, cut: 'cut30'}}
		/>
		<Composition id="Lab" component={Lab} durationInFrames={90} fps={FPS} width={1080} height={1350} />
	</>
);
