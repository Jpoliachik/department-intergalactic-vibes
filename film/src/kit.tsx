// Small shared pieces used across scenes.
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {SCENES} from './copy';
import {C, F} from './look';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...style}}>{children}</AbsoluteFill>
);

export const Backdrop: React.FC<{children?: React.ReactNode; tone?: string; edge?: string}> = ({
	children,
	tone = C.char,
	edge = C.black,
}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${tone} 0%, ${edge} 85%)`}}>{children}</AbsoluteFill>
);

/** A full-frame SVG sized to the composition. */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
	const {width, height} = useVideoConfig();
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0, ...style}}>
			{children}
		</svg>
	);
};

/** Concentric rings radiating from a point — sound made visible. */
export const Rings: React.FC<{cx: number; cy: number; speed?: number; gap?: number; max?: number; opacity?: number; color?: string}> = ({
	cx,
	cy,
	speed = 2.2,
	gap = 110,
	max = 1100,
	opacity = 0.35,
	color = C.light,
}) => {
	const frame = useCurrentFrame();
	const n = Math.ceil(max / gap) + 1;
	return (
		<g>
			{Array.from({length: n}, (_, i) => {
				const r = (frame * speed + i * gap) % (n * gap);
				return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={3} opacity={opacity * Math.max(0, 1 - r / max)} />;
			})}
		</g>
	);
};

/** Sunburst rays, the poster-era backdrop. */
export const Sunburst: React.FC<{cx: number; cy: number; rays?: number; spin?: number; a?: string; b?: string}> = ({
	cx,
	cy,
	rays = 28,
	spin = 0,
	a = '#2e2e2e',
	b = 'transparent',
}) => {
	const {width, height} = useVideoConfig();
	const R = Math.hypot(width, height) * 1.2;
	return (
		<g transform={`translate(${cx} ${cy}) rotate(${spin})`}>
			<circle r={R} fill={b} />
			{Array.from({length: rays}, (_, i) => {
				const a0 = (i / rays) * Math.PI * 2;
				const a1 = ((i + 0.5) / rays) * Math.PI * 2;
				return <polygon key={i} points={`0,0 ${Math.cos(a0) * R},${Math.sin(a0) * R} ${Math.cos(a1) * R},${Math.sin(a1) * R}`} fill={a} />;
			})}
		</g>
	);
};

/** A waveform polyline. */
export const wavePath = (w: number, h: number, t: number, seed: number, amp = 1, cycles?: number) => {
	const f1 = cycles ?? 2 + random(`f1${seed}`) * 3;
	const f2 = 5 + random(`f2${seed}`) * 6;
	const pts: string[] = [];
	for (let i = 0; i <= 120; i++) {
		const x = i / 120;
		const v = Math.sin(x * Math.PI * 2 * f1 + t * 0.18) * 0.7 + Math.sin(x * Math.PI * 2 * f2 - t * 0.31) * 0.3 * Math.sin(t * 0.05 + seed);
		pts.push(`${(x * w).toFixed(1)},${(h / 2 + v * amp * h * 0.36).toFixed(1)}`);
	}
	return pts.join(' ');
};

export const Scope: React.FC<{w: number; h: number; seed: number; amp: number; t: number; stroke?: number}> = ({w, h, seed, amp, t, stroke = 4}) => {
	const pts = wavePath(w, h, t, seed, amp);
	return (
		<svg width={w} height={h} style={{display: 'block'}}>
			{Array.from({length: 9}, (_, i) => (
				<line key={`v${i}`} x1={(w / 8) * i} x2={(w / 8) * i} y1={0} y2={h} stroke="#fff" opacity={0.12} />
			))}
			{Array.from({length: 7}, (_, i) => (
				<line key={`h${i}`} y1={(h / 6) * i} y2={(h / 6) * i} x1={0} x2={w} stroke="#fff" opacity={0.12} />
			))}
			<polyline points={pts} fill="none" stroke="#fff" strokeWidth={stroke * 3} opacity={0.18} />
			<polyline points={pts} fill="none" stroke="#fff" strokeWidth={stroke} />
		</svg>
	);
};

/** Mechanical counter. */
export const Digits: React.FC<{value: number; size: number; places?: number}> = ({value, size, places = 6}) => (
	<div style={{display: 'flex', gap: size * 0.08}}>
		{Math.floor(value)
			.toString()
			.padStart(places, '0')
			.split('')
			.map((d, i) => (
				<div
					key={i}
					style={{
						width: size * 0.62,
						height: size * 1.05,
						background: '#151515',
						border: '3px solid #666',
						borderRadius: 8,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: F.display,
						fontWeight: 700,
						fontSize: size * 0.82,
						color: C.paper,
						boxShadow: 'inset 0 -12px 18px #000, inset 0 12px 18px #000',
					}}
				>
					{d}
				</div>
			))}
	</div>
);

/** Rubber stamp impression. */
export const StampMark: React.FC<{text: string; size?: number; rotate?: number; p?: number; color?: string; style?: React.CSSProperties}> = ({
	text,
	size = 46,
	rotate = -14,
	p = 1,
	color = '#111',
	style,
}) => (
	<div
		style={{
			opacity: p,
			transform: `rotate(${rotate}deg) scale(${2.2 - 1.2 * p})`,
			border: `${size * 0.13}px solid ${color}`,
			borderRadius: size * 0.4,
			padding: `${size * 0.2}px ${size * 0.48}px`,
			boxShadow: `inset 0 0 0 ${size * 0.09}px transparent, inset 0 0 0 ${size * 0.15}px ${color}`,
			fontFamily: F.display,
			fontWeight: 700,
			fontSize: size,
			letterSpacing: size * 0.09,
			color,
			whiteSpace: 'nowrap',
			lineHeight: 1.1,
			...style,
		}}
	>
		{text}
	</div>
);

/** Little sparkle: four-point star. */
export const Sparkle: React.FC<{x: number; y: number; r: number; o?: number; rot?: number}> = ({x, y, r, o = 1, rot = 0}) => (
	<path
		transform={`translate(${x} ${y}) rotate(${rot})`}
		d={`M 0 ${-r} Q ${r * 0.15} ${-r * 0.15} ${r} 0 Q ${r * 0.15} ${r * 0.15} 0 ${r} Q ${-r * 0.15} ${r * 0.15} ${-r} 0 Q ${-r * 0.15} ${-r * 0.15} 0 ${-r} Z`}
		fill="#fff"
		opacity={o}
	/>
);

/** Caption plate used on diagram shots: "FIG. 1 — ..." */
export const FigLabel: React.FC<{n: number | string; children: React.ReactNode; top?: number; dark?: boolean}> = ({n, children, top = 110, dark}) => {
	const c = dark ? '#151515' : C.light;
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 90,
				right: 90,
				display: 'flex',
				alignItems: 'baseline',
				gap: 22,
				fontFamily: F.mono,
				fontSize: 30,
				letterSpacing: 4,
				color: c,
				textTransform: 'uppercase',
			}}
		>
			<span style={{border: `2px solid ${c}`, padding: '4px 12px'}}>FIG. {n}</span>
			<span>{children}</span>
		</div>
	);
};

/** Frame, relative to the start of `scene`, at which `seconds` falls. */
export const at = (scene: keyof typeof SCENES, seconds: number, fps = 30) => Math.round((seconds - SCENES[scene][0]) * fps);
