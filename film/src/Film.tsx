import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {BEATS, NARRATION, SCENES} from './copy';
import {Iris, Projector, Subtitles} from './look';
import {Final, FinePrint, Join, Radar, Requirements, Search} from './scenes/closing';
import {Cosmos, Officer, Us} from './scenes/middle';
import {Calibrate, Conveyor, Headline, stampFrames} from './scenes/montage';
import {History, Leader, Presents, Title} from './scenes/opening';

type SceneKey = keyof typeof SCENES;

export type FilmProps = {
	/** Burn the narration in as subtitles. Turn off once a voice track carries it. */
	subtitles: boolean;
	/** A narration file in public/, e.g. "narration.wav". Ducks the music under it. */
	narration: string | null;
	/** Real footage in public/ to replace a drawn scene, e.g. {crowd: "crowd.mp4"}. */
	footage: Partial<Record<SceneKey, string>>;
};

const DRAWN: Record<SceneKey, React.FC> = {
	leader: Leader,
	presents: Presents,
	title: Title,
	history: History,
	us: Us,
	officer: Officer,
	cosmos: Cosmos,
	headline: Headline,
	calibrate: Calibrate,
	conveyor: Conveyor,
	search: Search,
	join: Join,
	requirements: Requirements,
	radar: Radar,
	final: Final,
	finePrint: FinePrint,
};

// Iris in/out on a few big moments; straight cuts everywhere else, as the era did.
const IRIS: Partial<Record<SceneKey, {open?: boolean; close?: boolean}>> = {
	presents: {open: true},
	us: {open: true},
	search: {close: true},
	join: {open: true},
	final: {open: true},
};

/** Every sound effect, as [seconds, file, volume]. */
const useFoley = (): [number, string, number][] => {
	const {fps, width} = useVideoConfig();
	const [c0, c1] = SCENES.conveyor;
	const stamps = stampFrames(width, Math.round((c1 - c0) * fps), fps).map((f): [number, string, number] => [c0 + f / fps, 'thunk', 0.55]);
	return [
		[0.4, 'beep', 0.5],
		[BEATS.hatTip + 0.27, 'ding', 0.5],
		[SCENES.officer[0] + 118 / fps, 'ding', 0.6],
		[SCENES.headline[0], 'whoosh', 0.8],
		[SCENES.headline[0] + 20 / fps, 'thunk', 0.7],
		...stamps,
		[BEATS.rare, 'chime', 0.7],
		[BEATS.found, 'ping', 0.8],
		[SCENES.final[0] + 0.2, 'chime', 0.4],
		[BEATS.logged + 4 / fps, 'thunk', 1],
	];
};

export const Film: React.FC<FilmProps> = ({subtitles, narration, footage}) => {
	const {fps} = useVideoConfig();
	const foley = useFoley();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Projector>
				{(Object.keys(SCENES) as SceneKey[]).map((key) => {
					const [from, to] = SCENES[key];
					const dur = Math.round((to - from) * fps);
					const Drawn = DRAWN[key];
					const clip = footage[key];
					const iris = IRIS[key] ?? {};
					return (
						<Sequence key={key} name={key} from={Math.round(from * fps)} durationInFrames={dur}>
							<Iris openAt={iris.open ? 0 : undefined} closeAt={iris.close ? dur - 16 : undefined} length={16}>
								{clip ? (
									<OffthreadVideo src={staticFile(clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
								) : (
									<Drawn />
								)}
							</Iris>
						</Sequence>
					);
				})}
				{subtitles ? <Subtitles lines={NARRATION} /> : null}
			</Projector>

			<Audio
				src={staticFile('music.wav')}
				volume={(f) =>
					narration
						? interpolate(f, [0, 3 * fps, 4 * fps], [0.9, 0.9, 0.45], {extrapolateRight: 'clamp'})
						: 0.9
				}
			/>
			{narration ? <Audio src={staticFile(narration)} /> : null}
			<Audio src={staticFile('sfx/projector.wav')} volume={0.12} />
			{foley.map(([t, name, vol], i) => (
				<Sequence key={i} from={Math.round(t * fps)} layout="none">
					<Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
