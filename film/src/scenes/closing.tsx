import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, TITLE} from '../copy';
import {Backdrop, Center, Rings, Sparkle, Stage, StampMark, Sunburst, at, clamp} from '../kit';
import {C, F, PURPLE, Star, TINT} from '../look';
import {INK, Toon, dance} from '../toon';
import {LiveGlyph} from './opening';

// ================================================================ 0:35 always looking for more

const PLEIADES: [number, number, number][] = [
	[0, 0, 1],
	[-1.05, 0.12, 0.85],
	[-1.1, -0.16, 0.55],
	[1.0, 0.18, 0.85],
	[0.72, -0.38, 0.8],
	[0.86, -0.82, 0.65],
	[0.38, 0.5, 0.75],
];

const littleWave = (w: number, amp: number, cycles: number, t: number, wild = 0) => {
	const pts: string[] = [];
	for (let i = 0; i <= 60; i++) {
		const x = i / 60;
		const v =
			Math.sin(x * Math.PI * 2 * cycles - t) * (1 - wild * 0.3) +
			wild * (0.5 * Math.sin(x * Math.PI * 2 * cycles * 2.5 + t * 1.7) + 0.35 * Math.sin(x * Math.PI * 2 * cycles * 4.1 - t * 2.3));
		pts.push(`${(x - 0.5) * w},${v * amp}`);
	}
	return pts.join(' ');
};

export const Search: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const t = frame / fps;
	const rare = at('search', BEATS.rare, fps);
	const ground = H * 0.78;
	const crowd = Array.from({length: 7}, (_, i) => ({
		x: W * 0.08 + (i / 6) * W * 0.84,
		y: ground - (i % 2) * 34,
		s: 0.98 - (i % 2) * 0.1,
	}));
	const chosen = 4;
	// the beam sweeps, then settles on one person
	const sweepX = W * 0.5 + Math.sin(frame * 0.055) * W * 0.42;
	const landK = interpolate(frame, [rare - 14, rare], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const targetX = sweepX + (crowd[chosen].x - sweepX) * landK;
	const targetY = crowd[chosen].y - 120;
	const lamp = {x: W * 0.06, y: H * 0.98};
	const glow = interpolate(frame, [rare, rare + 20], [0, 1], clamp);
	const lit = (x: number) => Math.exp(-(((x - targetX) / 110) ** 2));
	return (
		<AbsoluteFill style={{background: '#0b0b0b'}}>
			<Stage>
				{Array.from({length: 150}, (_, i) => (
					<circle key={i} cx={random(`qx${i}`) * W} cy={random(`qy${i}`) * H * 0.6} r={0.8 + random(`qr${i}`) ** 4 * 2.4} fill="#fff" opacity={(0.3 + random(`qo${i}`) * 0.5) * (0.7 + 0.3 * Math.sin(frame * 0.2 + i))} />
				))}
				{PLEIADES.map(([x, y, b], i) => (
					<g key={i}>
						<circle cx={W * 0.68 + x * 90} cy={H * 0.16 + y * 90} r={18 * b} fill="#fff" opacity={0.15} />
						<circle cx={W * 0.68 + x * 90} cy={H * 0.16 + y * 90} r={3 + 3 * b} fill="#fff" />
					</g>
				))}
				<rect x={0} y={ground} width={W} height={H - ground} fill="#1c1c1c" />
				{/* beam */}
				<defs>
					<linearGradient id="beamG" x1="0" y1="1" x2="1" y2="0">
						<stop offset="0" stopColor="#fff" stopOpacity={0.6} />
						<stop offset="1" stopColor="#fff" stopOpacity={0.15} />
					</linearGradient>
				</defs>
				{(() => {
					const dx = targetX - lamp.x;
					const dy = targetY - lamp.y;
					const len = Math.hypot(dx, dy);
					const nx = -dy / len;
					const ny = dx / len;
					return (
						<g>
							<polygon
								points={`${lamp.x + nx * 20},${lamp.y + ny * 20} ${lamp.x - nx * 20},${lamp.y - ny * 20} ${targetX - nx * 150},${targetY - ny * 150} ${targetX + nx * 150},${targetY + ny * 150}`}
								fill="url(#beamG)"
							/>
							<ellipse cx={targetX} cy={ground + 10} rx={160} ry={34} fill="#fff" opacity={0.35} />
						</g>
					);
				})()}
				{crowd.map((p, i) => {
					const isOne = i === chosen;
					const l = lit(p.x);
					const tone = Math.round(70 + l * 140);
					const wild = isOne ? glow : 0;
					const wy = p.y - p.s * 300;
					const pts = littleWave(isOne ? 140 + 120 * glow : 110, isOne ? 14 + 26 * glow : 10, isOne ? 2 + glow : 1.5 + (i % 3) * 0.5, frame * 0.2 + i, wild);
					return (
						<g key={i}>
							<Toon
								kind="dancer"
								hair={(i % 4) as 0 | 1 | 2 | 3}
								tone={`rgb(${tone},${tone},${tone})`}
								skin={`rgb(${Math.round(110 + l * 120)},${Math.round(110 + l * 120)},${Math.round(110 + l * 120)})`}
								x={p.x}
								y={p.y}
								s={p.s * (isOne ? 1 + glow * 0.12 : 1)}
								pose={isOne && glow > 0 ? {...dance(t, 0, glow), mouth: 'grin'} : {...dance(t * 0.5, i + 1, 0.4), mouth: 'smile'}}
							/>
							<g transform={`translate(${p.x} ${wy - (isOne ? glow * 30 : 0)})`} opacity={0.35 + l * 0.65}>
								{isOne && glow > 0 ? <polyline points={pts} fill="none" stroke={PURPLE} strokeWidth={22} opacity={0.3 * glow} /> : null}
								{/* found: their frequency turns out to be ours */}
								<polyline points={pts} fill="none" stroke={isOne && glow > 0 ? PURPLE : '#fff'} strokeWidth={isOne ? 4 + glow * 3 : 3} style={isOne && glow > 0 ? {filter: TINT} : undefined} />
							</g>
						</g>
					);
				})}
				{glow > 0
					? Array.from({length: 7}, (_, k) => {
							const a = (k / 7) * Math.PI * 2 + frame * 0.03;
							const r = 170 + Math.sin(frame * 0.2 + k) * 20;
							return <Sparkle key={k} x={crowd[chosen].x + Math.cos(a) * r} y={targetY - 40 + Math.sin(a) * r * 0.8} r={12 + 10 * Math.abs(Math.sin(frame * 0.25 + k))} o={glow} rot={frame * 3} />;
						})
					: null}
				{/* the lamp */}
				<g transform={`translate(${lamp.x} ${lamp.y}) rotate(${(Math.atan2(targetY - lamp.y, targetX - lamp.x) * 180) / Math.PI + 90})`}>
					<rect x={-46} y={-40} width={92} height={110} rx={14} fill="#777" stroke={INK} strokeWidth={6} />
					<rect x={-52} y={-52} width={104} height={22} rx={8} fill="#fff" stroke={INK} strokeWidth={5} />
				</g>
			</Stage>
		</AbsoluteFill>
	);
};

// ================================================================ 0:42 JOIN THE MOVEMENT

export const Join: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 10, mass: 0.6}});
	const t = frame / fps;
	const line = spring({frame: frame - 10, fps, config: {damping: 14}});
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<Stage>
				<Sunburst cx={W / 2} cy={H * 0.3} spin={frame * 0.4} a="#2e2e2e" />
			</Stage>
			<div style={{position: 'absolute', top: H * 0.3, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(-50%) scale(${pop})`}}>
				<div style={{background: C.black, border: `5px solid ${C.paper}`, boxShadow: `0 0 0 10px ${C.black}, 0 0 0 13px ${C.light}`, padding: '36px 70px 30px', textAlign: 'center'}}>
					<div style={{fontFamily: F.display, fontWeight: 500, fontSize: 74, letterSpacing: 26, marginRight: -26, color: C.light, lineHeight: 1}}>{TITLE.join[0]}</div>
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 168, letterSpacing: 6, color: C.paper, lineHeight: 1.08}}>{TITLE.join[1]}</div>
				</div>
			</div>
			<Stage>
				{/* everybody, in perfect step */}
				<g transform={`translate(0 ${(1 - line) * 600})`}>
					<rect x={0} y={H * 0.79} width={W} height={H} fill="#1a1a1a" />
					{Array.from({length: 5}, (_, i) => (
						<Toon key={i} kind={i === 2 ? 'crew' : 'dancer'} hair={(i % 4) as 0 | 1 | 2 | 3} x={W * 0.12 + i * W * 0.19} y={H * 0.8} s={1.05} pose={dance(t, 0, 1.1)} />
					))}
				</g>
			</Stage>
		</AbsoluteFill>
	);
};

// ================================================================ 0:44 requirements

const Pulse: React.FC<{f: number}> = ({f}) => {
	const beat = (f % 24) / 24;
	const thump = 1 + Math.max(0, Math.sin(beat * Math.PI * 4)) * 0.14 * (beat < 0.25 ? 1 : 0);
	const pts: string[] = [];
	for (let i = 0; i <= 100; i++) {
		const x = i / 100;
		const ph = (x * 2 - f / 24) % 1;
		const p = ((ph % 1) + 1) % 1;
		const y = p > 0.4 && p < 0.44 ? -60 : p >= 0.44 && p < 0.48 ? 40 : p >= 0.48 && p < 0.5 ? -14 : Math.sin(p * 20) * 2;
		pts.push(`${x * 230},${y}`);
	}
	return (
		<g>
			<polyline points={pts.join(' ')} transform="translate(15 150)" fill="none" stroke="#fff" strokeWidth={5} />
			<path transform={`translate(195 62) scale(${thump})`} d="M 0 18 C -40 -10 -30 -42 0 -26 C 30 -42 40 -10 0 18 Z" fill="#fff" stroke={INK} strokeWidth={4} />
		</g>
	);
};

const Eye: React.FC<{f: number}> = ({f}) => {
	const look = Math.sin(f * 0.12) * 26;
	const blink = f % 50 > 46 ? 0.1 : 1;
	return (
		<g transform="translate(130 110)">
			<g transform={`scale(1 ${blink})`}>
				<path d="M -100 0 Q 0 -80 100 0 Q 0 80 -100 0 Z" fill="#f4f4f0" stroke={INK} strokeWidth={6} />
				<circle cx={look} cy={0} r={34} fill="#555" stroke={INK} strokeWidth={4} />
				<circle cx={look} cy={0} r={16} fill={INK} />
				<circle cx={look + 8} cy={-9} r={6} fill="#fff" />
			</g>
			<circle cx={50} cy={0} r={62} fill="none" stroke="#fff" strokeWidth={7} />
			<path d="M 108 20 Q 120 80 90 110" fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="6 6" />
		</g>
	);
};

const Hum: React.FC<{f: number}> = ({f}) => {
	const j = Math.sin(f * 2.1) * 2.5;
	return (
		<g>
			<g transform={`translate(${30 + j} 40)`}>
				<rect width={110} height={150} rx={8} fill="#888" stroke={INK} strokeWidth={5} />
				<path d="M 55 30 L 40 75 L 62 75 L 48 120" fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
			</g>
			{[0, 1, 2].map((k) => (
				<path key={k} d={`M ${155 + k * 16} ${70} q 8 15 0 30 q -8 15 0 30 q 8 15 0 30`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.4 + 0.6 * Math.abs(Math.sin(f * 0.3 + k))} />
			))}
			<Toon kind="dancer" hair={1} x={232} y={205} s={0.62} pose={{mouth: 'smile', blink: 1, armL: [10, 10], armR: [10, 10]}} />
		</g>
	);
};

export const Requirements: React.FC = () => {
	const frame = useCurrentFrame();
	const {height: H, fps} = useVideoConfig();
	const cues = [at('requirements', BEATS.pulse, fps), at('requirements', BEATS.eye, fps), at('requirements', BEATS.hum, fps)];
	const icons = [Pulse, Eye, Hum];
	const head = interpolate(frame, [0, 10], [0, 1], clamp);
	return (
		<Backdrop>
			<div style={{position: 'absolute', top: H * 0.09, left: 0, right: 0, textAlign: 'center', opacity: head}}>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 92, letterSpacing: 18, marginRight: -18, color: C.paper}}>REQUIREMENTS</div>
				<div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: C.light, marginTop: -4}}>are simple</div>
			</div>
			<div style={{position: 'absolute', top: H * 0.27, left: 110, right: 90, display: 'flex', flexDirection: 'column', gap: 26}}>
				{TITLE.requirements.map((r, i) => {
					const p = spring({frame: frame - cues[i], fps, config: {damping: 12, mass: 0.6}});
					const Icon = icons[i];
					return (
						<div key={r} style={{display: 'flex', alignItems: 'center', gap: 40, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -200}px)`}}>
							<svg width={280} height={220} style={{background: '#1b1b1b', border: `4px solid ${C.light}`, borderRadius: 24, flexShrink: 0}}>
								<Icon f={Math.max(0, frame - cues[i])} />
							</svg>
							<div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.serif, fontWeight: 700, fontSize: 64, lineHeight: 1.05, color: C.paper}}>
								<Star size={40} />
								{r}
							</div>
						</div>
					);
				})}
			</div>
		</Backdrop>
	);
};

// ================================================================ 0:48 we will find you

export const Radar: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const found = at('radar', BEATS.found, fps);
	const R = 400;
	const cx = W / 2;
	const cy = H * 0.45;
	const speed = 6; // degrees per frame
	const sweep = Math.min(frame, found) * speed;
	const targetA = found * speed;
	const target = {a: targetA, r: 250};
	const blips = Array.from({length: 16}, (_, i) => ({a: random(`ba${i}`) * 360, r: 80 + random(`br${i}`) * 300}));
	const lock = spring({frame: frame - found, fps, config: {damping: 12}});
	const pos = (a: number, r: number) => [cx + Math.cos(((a - 90) * Math.PI) / 180) * r, cy + Math.sin(((a - 90) * Math.PI) / 180) * r];
	const [tx, ty] = pos(target.a, target.r);
	const since = (a: number) => (((sweep - a) % 360) + 360) % 360;
	const scanBlink = Math.floor(frame / 10) % 2 === 0;
	return (
		<AbsoluteFill style={{background: '#0d0d0d'}}>
			<Stage>
				<circle cx={cx} cy={cy} r={R + 40} fill="#3a3a3a" stroke={INK} strokeWidth={8} />
				<circle cx={cx} cy={cy} r={R} fill="#151815" />
				{[1, 2, 3, 4].map((k) => (
					<circle key={k} cx={cx} cy={cy} r={(R * k) / 4} fill="none" stroke="#fff" strokeWidth={2} opacity={0.25} />
				))}
				<line x1={cx - R} x2={cx + R} y1={cy} y2={cy} stroke="#fff" opacity={0.25} strokeWidth={2} />
				<line y1={cy - R} y2={cy + R} x1={cx} x2={cx} stroke="#fff" opacity={0.25} strokeWidth={2} />
				{/* the sweep, with its afterglow */}
				{Array.from({length: 14}, (_, k) => {
					const a0 = sweep - k * 4;
					const [x1, y1] = pos(a0, R);
					const [x2, y2] = pos(a0 - 4, R);
					return <polygon key={k} points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`} fill="#fff" opacity={0.32 * (1 - k / 14)} />;
				})}
				{blips.map((b, i) => {
					const d = since(b.a);
					const o = frame * speed < b.a ? 0 : Math.max(0, 1 - d / 300);
					const [x, y] = pos(b.a, b.r);
					return <circle key={i} cx={x} cy={y} r={7} fill="#fff" opacity={o * 0.7} />;
				})}
				{/* the one */}
				{frame >= found - 1 ? (
					<g>
						{[0, 1, 2].map((k) => {
							const r = (((frame - found) * 2.5 + k * 30) % 90) + 6;
							return <circle key={k} cx={tx} cy={ty} r={r} fill="none" stroke={PURPLE} strokeWidth={4} opacity={1 - r / 96} />;
						})}
						<circle cx={tx} cy={ty} r={13} fill={PURPLE} stroke="#fff" strokeWidth={3} />
						<g transform={`translate(${tx} ${ty}) scale(${3 - 2 * lock}) rotate(${(1 - lock) * 90})`} opacity={lock}>
							{[0, 90, 180, 270].map((r) => (
								<path key={r} d="M -60 -30 L -60 -60 L -30 -60" transform={`rotate(${r})`} fill="none" stroke={PURPLE} strokeWidth={7} style={{filter: TINT}} />
							))}
						</g>
					</g>
				) : null}
			</Stage>
			<div style={{position: 'absolute', top: H * 0.09, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 34, letterSpacing: 6, color: C.light}}>
				{frame < found ? (scanBlink ? 'SCANNING FOR TRUE FREQUENCIES' : 'SCANNING FOR TRUE FREQUENCIES_') : 'CANDIDATE LOCATED'}
			</div>
			{frame >= found ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: cy + R + 70, display: 'flex', justifyContent: 'center', opacity: lock}}>
					<div style={{border: `4px solid ${C.paper}`, padding: '10px 26px', fontFamily: F.mono, fontSize: 30, letterSpacing: 4, color: C.paper}}>
						FREQUENCY: TRUE
					</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ================================================================ 0:54 final

export const Final: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const a = interpolate(frame, [6, 22], [0, 1], clamp);
	const logged = at('final', BEATS.logged, fps);
	const st = interpolate(frame, [logged, logged + 5], [0, 1], clamp);
	const shake = frame >= logged + 4 && frame < logged + 10 ? (random(`fs${frame}`) - 0.5) * 16 : 0;
	return (
		<Backdrop>
			<Stage>
				<Rings cx={W / 2} cy={H * 0.36} speed={2.6} gap={90} max={800} opacity={0.3} />
			</Stage>
			<Center style={{gap: 30, marginTop: -H * 0.16, transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
				<LiveGlyph size={360} amp={1.4} color={PURPLE} style={{filter: TINT}} />
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 116, letterSpacing: 26, marginRight: -26, color: C.paper, opacity: a}}>{TITLE.finalBrand}</div>
				<div style={{fontFamily: F.mono, fontSize: 36, letterSpacing: 6, color: C.light, opacity: a}}>{TITLE.url}</div>
			</Center>
			{st > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: H * 0.62, display: 'flex', justifyContent: 'center'}}>
					<StampMark text="FREQUENCY LOGGED" size={64} rotate={-9} p={st} color={PURPLE} style={{filter: TINT}} />
				</div>
			) : null}
		</Backdrop>
	);
};

// ================================================================ 0:58 fine print

export const FinePrint: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const o = Math.min(interpolate(frame, [2, 10], [0, 1], clamp), interpolate(frame, [52, 60], [1, 0], clamp));
	const peek = spring({frame: frame - 14, fps, config: {damping: 14}}) - interpolate(frame, [44, 56], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: C.black}}>
			<Center>
				<div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: 2, color: C.light, opacity: o, marginTop: -H * 0.08}}>{TITLE.finePrint}</div>
			</Center>
			<Stage>
				<g transform={`translate(0 ${(1 - peek) * 420})`}>
					<Toon x={W * 0.74} y={H + 60} s={1.9} pose={{armR: [150 + Math.sin(frame * 0.6) * 18, 20], mouth: 'grin', brow: 0.8, look: -1}} />
				</g>
			</Stage>
		</AbsoluteFill>
	);
};
