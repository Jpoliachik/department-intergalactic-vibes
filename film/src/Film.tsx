import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, NARRATION, SCENES} from './copy';
import {CUTS, Cut, designToCut, toDesign} from './cuts';
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
	/** A short cut from src/cuts (e.g. "cut30"), or null for the full 60s film. */
	cut?: string | null;
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

/** Every sound effect, as [seconds, file, volume], in design (60s) time. */
const useFoley = (): [number, string, number][] => {
	const {fps} = useVideoConfig();
	const [c0, c1] = SCENES.conveyor;
	// the belt is laid out on the 4:5 frame's width whatever the output shape
	const stamps = stampFrames(1080, Math.round((c1 - c0) * fps), fps).map((f): [number, string, number] => [c0 + f / fps, 'thunk', 0.55]);
	return [
		[0.4, 'beep', 0.5],
		[BEATS.hatTip + 0.27, 'ding', 0.5],
		[SCENES.officer[0] + 118 / fps, 'ding', 0.6],
		[SCENES.history[0] + 26 / fps, 'whoosh', 0.55],
		[SCENES.history[0] + 66 / fps, 'whoosh', 0.55],
		[SCENES.cosmos[0], 'whoosh', 0.45],
		[SCENES.headline[0], 'whoosh', 0.8],
		[SCENES.headline[0] + 20 / fps, 'thunk', 0.7],
		...stamps,
		[BEATS.rare, 'chime', 0.7],
		[BEATS.pulse, 'heartbeat', 0.9],
		[BEATS.eye, 'tink', 0.7],
		[BEATS.hum, 'hum', 0.5],
		// a faint return on every sweep, then the real one
		...[0, 1].map((k): [number, string, number] => [SCENES.radar[0] + k * 2, 'ping', 0.18]),
		[BEATS.found, 'ping', 0.8],
		[SCENES.final[0] + 0.2, 'chime', 0.4],
		[BEATS.logged + 4 / fps, 'thunk', 1],
	];
};

// A slow push-in on most shots, the way a rostrum camera would creep in on artwork.
const PUSH: Partial<Record<SceneKey, number>> = {
	presents: 1.04,
	title: 1,
	us: 1.04,
	officer: 1.05,
	headline: 1,
	calibrate: 1.05,
	conveyor: 1.03,
	search: 1.04,
	join: 1.03,
	requirements: 1.04,
	radar: 1.06,
	final: 1.05,
};

/** Play a scene's 60s design on the cut's warped clock. */
const Warp: React.FC<{cut: Cut | null; scene: SceneKey; children: React.ReactNode}> = ({cut, scene, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (!cut) return <>{children}</>;
	return <Freeze frame={toDesign(cut, scene, frame / fps) * fps}>{children}</Freeze>;
};

const Camera: React.FC<{push?: number; dur: number; children: React.ReactNode}> = ({push = 1, dur, children}) => {
	const frame = useCurrentFrame();
	const k = interpolate(frame, [0, dur], [1, push]);
	return <AbsoluteFill style={{transform: `scale(${k})`}}>{children}</AbsoluteFill>;
};

/** A hard cut on a print is a splice: a frame or two of overexposure, and the tape's edge. */
const Splice: React.FC = () => {
	const frame = useCurrentFrame();
	if (frame > 1) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: '#fff', opacity: frame === 0 ? 0.32 : 0.1}} />
			{frame === 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: '38%', height: 5, background: '#000', opacity: 0.5}} /> : null}
		</AbsoluteFill>
	);
};

export const Film: React.FC<FilmProps> = ({subtitles, narration, footage, cut: cutName = null}) => {
	const {fps} = useVideoConfig();
	const cut = cutName ? CUTS[cutName] : null;
	const scenes = cut ? cut.scenes : SCENES;
	const voice = cut ? cut.narration : narration;
	const irisLength = cut ? 9 : 16;
	// foley moves with the picture; in a fast cut, stamps closer than a few frames merge into one
	const foley = useFoley()
		.map(([t, name, vol]): [number, string, number] => [cut ? designToCut(cut, t) : t, name, vol])
		.filter(([t]) => Number.isFinite(t))
		.filter(([t, name], i, all) => !all.slice(0, i).some(([t0, n0]) => n0 === name && Math.abs(t - t0) < 0.07));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Projector>
				{(Object.keys(SCENES) as SceneKey[]).map((key) => {
					const [from, to] = scenes[key];
					const dur = Math.round((to - from) * fps);
					if (dur <= 0) return null; // dropped from this cut
					const Drawn = DRAWN[key];
					const clip = footage[key];
					// a short cut opens on a lit frame: it's also the thumbnail
					const iris = cut && from === 0 ? {} : (IRIS[key] ?? {});
					return (
						<Sequence key={key} name={key} from={Math.round(from * fps)} durationInFrames={dur}>
							<Iris openAt={iris.open ? 0 : undefined} closeAt={iris.close ? dur - irisLength : undefined} length={irisLength}>
								<Camera push={PUSH[key]} dur={dur}>
									{clip ? (
										<OffthreadVideo src={staticFile(clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
									) : (
										<Warp cut={cut} scene={key}>
											<Drawn />
										</Warp>
									)}
								</Camera>
							</Iris>
							{iris.open || from === 0 ? null : <Splice />}
						</Sequence>
					);
				})}
				{subtitles ? <Subtitles lines={cut ? cut.lines : NARRATION} /> : null}
			</Projector>

			<Audio
				src={staticFile(cut ? cut.music : 'music.wav')}
				volume={(f) => {
					if (!voice) return 0.9;
					// full for the opening fanfare, then under the narrator
					const [a, b] = cut ? [0.8, 1.0] : [3, 4];
					return interpolate(f, [0, a * fps, b * fps], [0.9, 0.9, 0.45], {extrapolateRight: 'clamp'});
				}}
			/>
			{voice ? <Audio src={staticFile(voice)} /> : null}
			<Audio src={staticFile('sfx/projector.wav')} volume={0.12} />
			{foley.map(([t, name, vol], i) => (
				<Sequence key={i} from={Math.round(t * fps)} layout="none">
					<Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
