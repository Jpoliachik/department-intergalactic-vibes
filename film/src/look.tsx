// The shared vocabulary: fonts, the mark, the projector, the iris, the subtitles.
import React from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	interpolate,
	random,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {DISC, RING, WAVES} from './mark-paths';

// ---------------------------------------------------------------- type

export const F = {
	display: 'Oswald, sans-serif',
	serif: 'Cormorant, serif',
	mono: '"Plex Mono", monospace',
};

const FONTS: [string, string, FontFaceDescriptors][] = [
	['Oswald', 'oswald-latin-500-normal.woff2', {weight: '500'}],
	['Oswald', 'oswald-latin-700-normal.woff2', {weight: '700'}],
	['Cormorant', 'cormorant-latin-600-normal.woff2', {weight: '600'}],
	['Cormorant', 'cormorant-latin-700-normal.woff2', {weight: '700'}],
	['Cormorant', 'cormorant-latin-500-italic.woff2', {weight: '500', style: 'italic'}],
	['Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', {weight: '500'}],
];

const fontHandle = delayRender('fonts');
Promise.all(
	FONTS.map(([family, file, desc]) => {
		const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, desc);
		(document.fonts as unknown as Set<FontFace>).add(face);
		return face.load();
	}),
).then(() => continueRender(fontHandle));

// Projected-light palette. The film is black and white, with one hand-tinted
// colour: Vibe Corp purple (the crew's hi-vis). Purple only ever marks Vibe Corp
// — a vest, the mark, a frequency we've found. Nothing else gets colour.
export const PURPLE = '#a274d6';
export const PURPLE_DEEP = '#6c44a3';
/** Stencil-tint misregistration: the colour sits a hair off the line, like it was laid on by hand. */
export const TINT = 'drop-shadow(2.5px -1.5px 0 rgba(162,116,214,0.38))';

export const C = {
	black: '#070707',
	ink: '#141414',
	char: '#232323',
	mid: '#7a7a7a',
	light: '#d8d8d8',
	paper: '#ecebe6',
};

// ---------------------------------------------------------------- the mark

export const Glyph: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({
	size,
	color = C.paper,
	style,
}) => (
	<svg viewBox="32.9 31.1 86 86" width={size} height={size} style={style}>
		<g fill={color}>
			{WAVES.map((d) => (
				<path key={d} d={d} />
			))}
		</g>
	</svg>
);

export const Badge: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
	<svg viewBox="0 0 150 150" width={size} height={size} style={style}>
		<path d={DISC} fill={C.black} />
		<path d={RING} fill="none" stroke={C.paper} strokeWidth={1.75} />
		<g fill={C.paper}>
			{WAVES.map((d) => (
				<path key={d} d={d} />
			))}
		</g>
	</svg>
);

// Seven-point star, for rules and bullets.
export const Star: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({
	size,
	color = C.paper,
	style,
}) => {
	const pts: string[] = [];
	for (let i = 0; i < 14; i++) {
		const r = i % 2 === 0 ? 50 : 22;
		const a = (Math.PI * i) / 7 - Math.PI / 2;
		pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`);
	}
	return (
		<svg viewBox="0 0 100 100" width={size} height={size} style={style}>
			<polygon points={pts.join(' ')} fill={color} />
		</svg>
	);
};

export const StarRule: React.FC<{width: number; color?: string}> = ({width, color = C.light}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 18, width}}>
		<div style={{flex: 1, height: 3, background: color}} />
		{[0, 1, 2].map((i) => (
			<Star key={i} size={i === 1 ? 34 : 22} color={color} />
		))}
		<div style={{flex: 1, height: 3, background: color}} />
	</div>
);

// ---------------------------------------------------------------- transitions

/** Classic iris: a circle that opens from black (dir=in) or closes to black (dir=out). */
export const Iris: React.FC<{
	children: React.ReactNode;
	openAt?: number;
	closeAt?: number;
	length?: number;
}> = ({children, openAt, closeAt, length = 18}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const full = Math.hypot(width, height) / 2 + 4;
	let r = full;
	if (openAt !== undefined && frame < openAt + length) {
		r = interpolate(frame, [openAt, openAt + length], [0, full], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}
	if (closeAt !== undefined && frame > closeAt) {
		r = interpolate(frame, [closeAt, closeAt + length], [full, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}
	return (
		<AbsoluteFill style={{background: C.black}}>
			<AbsoluteFill style={{clipPath: `circle(${r}px at 50% 50%)`}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Fade a scene in from black over its first frames and out over its last. */
export const Fade: React.FC<{children: React.ReactNode; inF?: number; outF?: number; dur: number}> = ({
	children,
	inF = 8,
	outF = 8,
	dur,
}) => {
	const frame = useCurrentFrame();
	const o = Math.min(
		inF ? interpolate(frame, [0, inF], [0, 1], {extrapolateRight: 'clamp'}) : 1,
		outF ? interpolate(frame, [dur - outF, dur], [1, 0], {extrapolateLeft: 'clamp'}) : 1,
	);
	return <AbsoluteFill style={{opacity: o, background: C.black}}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- the projector

/**
 * Everything that makes it a print run through a projector: greyscale grade,
 * gate weave, flicker, grain, dust, scratches, vignette, rounded gate.
 */
export const Projector: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	// gate weave — small, constant; a bigger hop every so often
	const hop = random(`hop${Math.floor(frame / 40)}`) > 0.85 ? 1 : 0;
	const wx = (random(`wx${frame}`) - 0.5) * 3 + Math.sin(frame / 9) * 1.2;
	const wy = (random(`wy${frame}`) - 0.5) * 3.5 + hop * (random(`hy${frame}`) - 0.5) * 8;

	// flicker
	const flicker = 1 + (random(`fl${frame}`) - 0.5) * 0.09 + Math.sin(frame * 1.7) * 0.012;

	// scratches persist for a few frames, then jump
	const scratchSeed = Math.floor(frame / 5);
	const scratches = [0, 1, 2]
		.filter((i) => random(`sc${scratchSeed}-${i}`) > 0.55)
		.map((i) => ({
			x: random(`sx${scratchSeed}-${i}`) * width + (random(`sj${frame}-${i}`) - 0.5) * 4,
			w: 1 + random(`sw${scratchSeed}-${i}`) * 2,
			light: random(`sl${scratchSeed}-${i}`) > 0.5,
			o: 0.15 + random(`so${frame}-${i}`) * 0.25,
			top: random(`st${scratchSeed}-${i}`) * height * 0.4,
			len: height * (0.5 + random(`sh${scratchSeed}-${i}`) * 0.6),
		}));

	// dust: a few specks and the occasional hair, one frame each
	const dust = Array.from({length: 7}, (_, i) => i)
		.filter((i) => random(`d${frame}-${i}`) > 0.6)
		.map((i) => ({
			x: random(`dx${frame}-${i}`) * width,
			y: random(`dy${frame}-${i}`) * height,
			r: 1.5 + random(`dr${frame}-${i}`) ** 3 * 9,
			light: random(`dl${frame}-${i}`) > 0.7,
		}));
	const hair = random(`hair${frame}`) > 0.93;

	// cue marks near the end of the reel, as a projectionist would see them
	const cue = (frame >= 1713 && frame < 1717) || (frame >= 1767 && frame < 1771);

	return (
		<AbsoluteFill style={{background: C.black}}>
			<AbsoluteFill
				style={{
					transform: `translate(${wx}px, ${wy}px) scale(1.012)`,
					// no greyscale pass: everything is drawn in neutral greys, so the purple survives
					filter: `contrast(1.12) brightness(${flicker})`,
				}}
			>
				{children}
			</AbsoluteFill>

			{/* grain */}
			<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.55}}>
				<svg width={width} height={height}>
					<filter id={`g${frame}`}>
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.85"
							numOctaves={2}
							seed={frame % 97}
							stitchTiles="stitch"
						/>
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<rect width="100%" height="100%" filter={`url(#g${frame})`} />
				</svg>
			</AbsoluteFill>

			{/* scratches & dust */}
			<AbsoluteFill>
				<svg width={width} height={height}>
					{scratches.map((s, i) => (
						<rect
							key={i}
							x={s.x}
							y={s.top}
							width={s.w}
							height={s.len}
							fill={s.light ? '#fff' : '#000'}
							opacity={s.o}
						/>
					))}
					{dust.map((d, i) => (
						<ellipse
							key={i}
							cx={d.x}
							cy={d.y}
							rx={d.r}
							ry={d.r * 0.7}
							fill={d.light ? '#fff' : '#000'}
							opacity={0.7}
						/>
					))}
					{hair ? (
						<path
							d={`M ${random(`hx${frame}`) * width} ${random(`hy2${frame}`) * height} q 40 -60 90 -20 t 70 30`}
							stroke="#000"
							strokeWidth={2}
							fill="none"
							opacity={0.6}
						/>
					) : null}
					{cue ? <circle cx={width - 110} cy={110} r={34} fill="#000" opacity={0.85} /> : null}
				</svg>
			</AbsoluteFill>

			{/* vignette + hot spot */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse at 50% 46%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0.85) 100%)',
				}}
			/>

			{/* the gate: soft rounded corners of a projected frame */}
			<AbsoluteFill
				style={{
					borderRadius: 46,
					boxShadow: `0 0 0 80px ${C.black}, inset 0 0 40px 14px ${C.black}`,
				}}
			/>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- subtitles

export const Subtitles: React.FC<{lines: {from: number; to: number; text: string}[]}> = ({lines}) => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();
	const t = frame / fps;
	const line = lines.find((l) => t >= l.from && t < l.to);
	if (!line) return null;
	const o = Math.min(
		interpolate(t, [line.from, line.from + 0.18], [0, 1], {extrapolateRight: 'clamp'}),
		interpolate(t, [line.to - 0.18, line.to], [1, 0], {extrapolateLeft: 'clamp'}),
	);
	const bottom = height > 1600 ? 300 : 120;
	return (
		<>
		{/* a soft dark band so the line reads over busy shots */}
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: bottom - 120,
				height: 380,
				opacity: o,
				background: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 35%, rgba(0,0,0,0.72) 62%, rgba(0,0,0,0) 100%)',
			}}
		/>
		<div
			style={{
				position: 'absolute',
				left: 100,
				right: 100,
				bottom,
				textAlign: 'center',
				fontFamily: F.serif,
				fontWeight: 700,
				fontSize: 50,
				lineHeight: 1.18,
				color: '#f4f4f0',
				opacity: o,
				textShadow: '0 0 6px #000, 0 0 14px #000, 0 2px 2px #000',
			}}
		>
			{line.text}
		</div>
		</>
	);
};
