import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS} from '../copy';
import {Backdrop, FigLabel, Sparkle, Stage, at, clamp} from '../kit';
import {C, F} from '../look';
import {INK, Pose, Toon, dance} from '../toon';

const mix = (a: Pose, b: Pose, k: number): Pose => {
	const out: Pose = {...a};
	const lerp = (x = 0, y = 0) => x + (y - x) * k;
	out.armL = [lerp(a.armL?.[0] ?? 12, b.armL?.[0] ?? 12), lerp(a.armL?.[1] ?? 6, b.armL?.[1] ?? 6)];
	out.armR = [lerp(a.armR?.[0] ?? 12, b.armR?.[0] ?? 12), lerp(a.armR?.[1] ?? 6, b.armR?.[1] ?? 6)];
	out.tilt = lerp(a.tilt, b.tilt);
	out.bounce = lerp(a.bounce, b.bounce);
	if (k > 0.5 && b.mouth) out.mouth = b.mouth;
	return out;
};

// ================================================================ 0:10 "That someone is us."

const StringLights: React.FC<{W: number; y: number; f: number}> = ({W, y, f}) => {
	const sag = 70;
	const bulbs = 15;
	const path = `M -20 ${y} Q ${W / 2} ${y + sag * 2} ${W + 20} ${y}`;
	return (
		<g>
			<path d={path} stroke={INK} strokeWidth={4} fill="none" />
			{Array.from({length: bulbs}, (_, i) => {
				const u = (i + 0.5) / bulbs;
				const bx = -20 + u * (W + 40);
				const by = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * (y + sag * 2) + u * u * y;
				const on = Math.sin(f * 0.15 + i * 2.1) > -0.3;
				return (
					<g key={i}>
						{on ? <circle cx={bx} cy={by + 18} r={26} fill="#fff" opacity={0.35} /> : null}
						<ellipse cx={bx} cy={by + 16} rx={10} ry={14} fill={on ? '#fff' : '#888'} stroke={INK} strokeWidth={3} />
					</g>
				);
			})}
		</g>
	);
};

export const Us: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const t = frame / fps;
	const tip = at('us', BEATS.hatTip, fps);
	// the crowd is in slow motion
	const slow = t * 0.45;
	const waveX = interpolate(frame, [0, 132], [-200, W + 300]);
	const rows = [
		{y: H * 0.5, s: 0.62, n: 10, tone: '#9a9a9a'},
		{y: H * 0.6, s: 0.8, n: 8, tone: '#b5b5b5'},
		{y: H * 0.72, s: 1.0, n: 7, tone: '#d0d0d0'},
	];
	const pop = spring({frame: frame - 10, fps, config: {damping: 13, mass: 0.8}});
	const tipK = interpolate(frame, [tip, tip + 8, tip + 34, tip + 44], [0, 1, 1, 0], clamp);
	const crewPose: Pose = {
		look: interpolate(frame, [tip - 14, tip - 4], [-1, 0], clamp),
		mouth: frame > tip - 4 ? 'grin' : 'smile',
		brow: tipK * 0.8,
		armL: [14, 8],
		armR: [12 + tipK * 150, 8 + tipK * 30],
		hatLift: tipK * 34,
		blink: frame > tip + 46 && frame < tip + 50 ? 1 : 0,
	};
	return (
		<AbsoluteFill style={{background: '#cfcfca'}}>
			<Stage>
				<defs>
					<linearGradient id="dusk" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0" stopColor="#8e8e8a" />
						<stop offset="0.6" stopColor="#d6d6d0" />
					</linearGradient>
				</defs>
				<rect width={W} height={H} fill="url(#dusk)" />
				{/* tents on the horizon */}
				{[0.12, 0.42, 0.78].map((p, i) => (
					<g key={i} transform={`translate(${W * p} ${H * 0.47})`}>
						<path d="M -150 0 L 0 -150 L 150 0 Z" fill={i % 2 ? '#7a7a76' : '#efefea'} stroke={INK} strokeWidth={5} />
						<path d="M -50 0 L 0 -150 L 50 0" fill="none" stroke={INK} strokeWidth={4} />
						<line x1={0} y1={-150} x2={0} y2={-200} stroke={INK} strokeWidth={4} />
						<path d={`M 0 -200 L ${40 + Math.sin(frame * 0.2 + i) * 6} -188 L 0 -176 Z`} fill={INK} />
					</g>
				))}
				<StringLights W={W} y={H * 0.1} f={frame} />
				{rows.map((r, ri) =>
					Array.from({length: r.n}, (_, i) => {
						const x = ((i + 0.5 + (random(`ux${ri}${i}`) - 0.5) * 0.4) / r.n) * (W + 100) - 50;
						const wave = Math.exp(-(((x - waveX) / 160) ** 2));
						const base = dance(slow, ri * 7 + i, 0.8);
						const pose = mix(base, {armL: [170, 0], armR: [170, 0], bounce: 30, mouth: 'grin'}, wave);
						return <Toon key={`${ri}-${i}`} kind="dancer" hair={((i + ri) % 4) as 0 | 1 | 2 | 3} tone={r.tone} x={x} y={r.y} s={r.s} pose={pose} />;
					}),
				)}
				{/* and, in the front row, one of us */}
				<g transform={`translate(0 ${(1 - pop) * 700})`}>
					<Toon x={W * 0.5} y={H + 90} s={2.2} pose={crewPose} />
					{tipK > 0.6
						? [0, 1, 2].map((k) => (
								<Sparkle key={k} x={W * 0.5 + 140 + k * 50} y={H + 90 - 2.2 * 262 - 40 - k * 40} r={16 + k * 6} o={tipK} rot={frame * 4} />
							))
						: null}
				</g>
			</Stage>
		</AbsoluteFill>
	);
};

// ================================================================ 0:15 officer

const Gauge: React.FC<{x: number; y: number; v: number; label: string}> = ({x, y, v, label}) => {
	const a = Math.PI + Math.min(1.06, v) * Math.PI;
	return (
		<g transform={`translate(${x} ${y})`}>
			<path d="M -150 0 A 150 150 0 0 1 150 0 Z" fill="#f4f4f0" stroke={INK} strokeWidth={6} />
			<path d="M 106 -106 A 150 150 0 0 1 150 0 L 0 0 Z" fill="#555" />
			{Array.from({length: 9}, (_, i) => {
				const aa = Math.PI + (Math.PI * i) / 8;
				return <line key={i} x1={Math.cos(aa) * 150} y1={Math.sin(aa) * 150} x2={Math.cos(aa) * 128} y2={Math.sin(aa) * 128} stroke={INK} strokeWidth={4} />;
			})}
			<line x1={0} y1={0} x2={Math.cos(a) * 125} y2={Math.sin(a) * 125} stroke={INK} strokeWidth={8} strokeLinecap="round" />
			<circle r={13} fill={INK} />
			<text y={46} textAnchor="middle" fontFamily={F.mono} fontSize={24} letterSpacing={3} fill={INK}>
				{label}
			</text>
		</g>
	);
};

export const Officer: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const t = frame / fps;
	const floor = H * 0.8;
	const energy = interpolate(frame, [0, 130], [0.5, 1.6], clamp);
	const nod =
		interpolate(frame, [34, 48, 64], [0, 15, 0], {...clamp, easing: Easing.inOut(Easing.sin)}) +
		interpolate(frame, [84, 98, 114], [0, 15, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
	const meter = interpolate(frame, [10, 125], [0.15, 1.06], clamp) + Math.sin(frame * 0.6) * 0.03;
	const tick = spring({frame: frame - 118, fps, config: {damping: 9}});
	const bubble = spring({frame: frame - 6, fps, config: {damping: 14}});
	const peg = frame > 120 ? Math.sin(frame * 2.2) * 6 : 0;
	return (
		<AbsoluteFill style={{background: '#c6c6c0'}}>
			<Stage>
				<rect x={0} y={floor} width={W} height={H - floor} fill="#3a3a3a" />
				<line x1={0} x2={W} y1={floor} y2={floor} stroke={INK} strokeWidth={6} />
				{/* the dancer, warming up */}
				<Toon kind="dancer" hair={3} x={W * 0.7} y={floor + 6} s={1.55} pose={dance(t * (0.8 + energy * 0.3), 0, energy)} />
				{/* the reading */}
				<Toon x={W * 0.27} y={floor + 6} s={1.55} hold="clipboard" pose={{nod, brow: -1, mouth: 'flat', armR: [40, 70], look: 1}} />
				<g transform={`translate(${W * 0.3 + peg} ${H * 0.3}) scale(${bubble})`}>
					<ellipse cx={0} cy={0} rx={220} ry={150} fill="#f4f4f0" stroke={INK} strokeWidth={6} />
					<circle cx={-110} cy={170} r={24} fill="#f4f4f0" stroke={INK} strokeWidth={5} />
					<circle cx={-140} cy={215} r={13} fill="#f4f4f0" stroke={INK} strokeWidth={4} />
					<Gauge x={0} y={50} v={meter} label={meter > 1 ? 'OFF THE CHARTS' : 'VIBE LEVEL'} />
				</g>
				<g transform={`translate(${W * 0.27 + 120} ${floor - 300}) scale(${tick})`}>
					<path d="M -40 0 L -10 34 L 50 -40" fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
				</g>
			</Stage>
			<FigLabel n={2} dark>
				Assessment in progress
			</FigLabel>
		</AbsoluteFill>
	);
};

// ================================================================ 0:20 the universe, monitored

const Planet: React.FC<{x: number; y: number; r: number; ring?: boolean; tone: string; f: number; k: number}> = ({x, y, r, ring, tone, f, k}) => (
	<g transform={`translate(${x} ${y})`}>
		{[0, 1].map((j) => {
			const rr = r + (((f * 1.4 + j * 30 + k * 13) % 60) / 60) * r * 1.4;
			return <circle key={j} r={rr} fill="none" stroke="#fff" strokeWidth={2} opacity={0.5 * (1 - (rr - r) / (r * 1.4))} />;
		})}
		{ring ? <ellipse rx={r * 1.9} ry={r * 0.45} fill="none" stroke="#ddd" strokeWidth={r * 0.18} transform="rotate(-18)" /> : null}
		<circle r={r} fill={tone} stroke={INK} strokeWidth={Math.max(2, r * 0.06)} />
	</g>
);

const DIALS = ['ORION', 'LYRA', 'PLEIADES', 'CYGNUS', 'DRACO', 'CASSIOPEIA'];

const Console: React.FC<{f: number; W: number; H: number}> = ({f, W, H}) => {
	const cols = 2;
	const cw = 360;
	const ch = 300;
	const x0 = W / 2 - cw;
	const y0 = H * 0.2;
	return (
		<g>
			<rect x={x0 - 50} y={y0 - 90} width={cw * 2 + 100} height={ch * 3 + 170} rx={30} fill="#4a4a4a" stroke={INK} strokeWidth={8} />
			<text x={W / 2} y={y0 - 30} textAnchor="middle" fontFamily={F.mono} fontSize={30} letterSpacing={6} fill="#eee">
				THE UNIVERSE · ALL FREQUENCIES
			</text>
			{DIALS.map((name, i) => {
				const cx = x0 + (i % cols) * cw + cw / 2;
				const cy = y0 + Math.floor(i / cols) * ch + 150;
				const a = Math.PI * 1.2 + (0.3 + 0.25 * Math.sin(f * (0.1 + i * 0.03) + i * 2) + 0.1 * Math.sin(f * 0.9 + i)) * Math.PI * 0.6;
				const lamp = Math.sin(f * 0.4 + i * 1.7) > 0;
				return (
					<g key={name}>
						<circle cx={cx} cy={cy - 20} r={110} fill="#f4f4f0" stroke={INK} strokeWidth={6} />
						{Array.from({length: 11}, (_, j) => {
							const aa = Math.PI * 1.2 + (j / 10) * Math.PI * 0.6;
							return <line key={j} x1={cx + Math.cos(aa) * 100} y1={cy - 20 + Math.sin(aa) * 100} x2={cx + Math.cos(aa) * 82} y2={cy - 20 + Math.sin(aa) * 82} stroke={INK} strokeWidth={4} />;
						})}
						<line x1={cx} y1={cy - 20} x2={cx + Math.cos(a) * 90} y2={cy - 20 + Math.sin(a) * 90} stroke={INK} strokeWidth={7} strokeLinecap="round" />
						<circle cx={cx} cy={cy - 20} r={11} fill={INK} />
						<text x={cx} y={cy + 40} textAnchor="middle" fontFamily={F.mono} fontSize={26} letterSpacing={3} fill={INK}>
							{name}
						</text>
						<circle cx={cx + 120} cy={cy - 110} r={14} fill={lamp ? '#fff' : '#333'} stroke={INK} strokeWidth={4} />
						{lamp ? <circle cx={cx + 120} cy={cy - 110} r={30} fill="#fff" opacity={0.3} /> : null}
					</g>
				);
			})}
		</g>
	);
};

const Stars: React.FC<{W: number; H: number; f: number; n?: number}> = ({W, H, f, n = 180}) => (
	<g>
		{Array.from({length: n}, (_, i) => (
			<circle
				key={i}
				cx={random(`sx${i}`) * W}
				cy={random(`sy${i}`) * H}
				r={0.8 + random(`sr${i}`) ** 4 * 3}
				fill="#fff"
				opacity={(0.3 + random(`so${i}`) * 0.6) * (0.7 + 0.3 * Math.sin(f * 0.2 + i))}
			/>
		))}
	</g>
);

export const Cosmos: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const hammock = at('cosmos', BEATS.hammock, fps);
	if (frame >= hammock) return <Hammock f={frame - hammock} />;
	const zoom = Math.exp(interpolate(frame, [0, 48], [Math.log(7), Math.log(0.55)], {...clamp, easing: Easing.inOut(Easing.cubic)}));
	const consoleIn = spring({frame: frame - 44, fps, config: {damping: 15}});
	const cx = W / 2;
	const cy = H * 0.45;
	const planets: [number, number, number, boolean, string][] = [
		[260, 0.3, 30, false, '#999'],
		[420, 2.2, 46, false, '#ccc'],
		[600, 4.1, 70, true, '#bbb'],
		[760, 5.3, 40, false, '#888'],
	];
	return (
		<AbsoluteFill style={{background: C.black}}>
			<Stage>
				<Stars W={W} H={H} f={frame} />
				<g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`} opacity={1 - consoleIn * 0.75}>
					{planets.map(([r, a]) => (
						<circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={1.5 / zoom} opacity={0.3} />
					))}
					{planets.map(([r, a, pr, ring, tone], k) => {
						const aa = a + frame * 0.01 * (1 + k * 0.3);
						return <Planet key={r} x={cx + Math.cos(aa) * r} y={cy + Math.sin(aa) * r * 0.9} r={pr} ring={ring} tone={tone} f={frame} k={k} />;
					})}
					{/* Earth, with a festival on it */}
					<g transform={`translate(${cx} ${cy})`}>
						<circle r={60} fill="#e0e0e0" stroke={INK} strokeWidth={4} />
						<path d="M -40 -30 Q -10 -50 10 -30 Q 30 -10 0 0 Q -30 20 -40 -30 Z M 10 20 Q 40 10 45 30 Q 30 50 15 40 Z" fill="#8a8a8a" />
						{[0, 1, 2].map((j) => {
							const rr = ((frame * 0.8 + j * 10) % 30) + 2;
							return <circle key={j} cx={-14} cy={-24} r={rr} fill="none" stroke={INK} strokeWidth={1.4} opacity={1 - rr / 32} />;
						})}
						<circle cx={-14} cy={-24} r={3} fill={INK} />
					</g>
				</g>
				<g transform={`translate(0 ${(1 - consoleIn) * H})`}>
					<Console f={frame} W={W} H={H} />
				</g>
			</Stage>
		</AbsoluteFill>
	);
};

/** "...so you don't have to." */
const Hammock: React.FC<{f: number}> = ({f}) => {
	const {width: W, height: H} = useVideoConfig();
	const sway = Math.sin(f * 0.08) * 4;
	const mx = W * 0.5;
	const my = H * 0.52;
	return (
		<AbsoluteFill style={{background: C.black}}>
			<Stage>
				<Stars W={W} H={H} f={f + 200} n={140} />
				{/* crescent moon */}
				<g transform={`translate(${mx} ${my}) rotate(${sway * 0.2})`}>
					<path d="M -330 -160 A 380 380 0 1 0 330 -160 A 330 300 0 1 1 -330 -160 Z" fill="#e8e8e2" stroke={INK} strokeWidth={8} />
					{[
						[-160, 140, 30],
						[120, 190, 22],
						[0, 250, 16],
					].map(([x, y, r]) => (
						<circle key={x} cx={x} cy={y} r={r} fill="#c8c8c2" stroke={INK} strokeWidth={4} />
					))}
					{/* lounging in the curve of it */}
					<g transform="translate(150 125) rotate(-84)">
						<Toon kind="dancer" hair={0} x={0} y={0} s={1.05} hold="tea" pose={{blink: 1, mouth: 'smile', armL: [165, 70], armR: [60, 95], legL: 2, legR: 14}} />
					</g>
				</g>
				{[0, 1, 2].map((k) => {
					const p = ((f + k * 18) % 54) / 54;
					return (
						<text key={k} x={mx + 140 + p * 120 + k * 10} y={my - 300 - p * 200} fontFamily={F.display} fontWeight={700} fontSize={40 + p * 40} fill="#fff" opacity={Math.sin(p * Math.PI)}>
							z
						</text>
					);
				})}
			</Stage>
		</AbsoluteFill>
	);
};
