import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TITLE} from '../copy';
import {Backdrop, Center, Rings, Stage, clamp} from '../kit';
import {C, F, StarRule} from '../look';
import {WAVES} from '../mark-paths';
import {Toon, dance} from '../toon';

// ================================================================ 0:00 leader

/** Academy leader: 3, 2, 1, with the clock sweep. */
export const Leader: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	if (frame >= 36) return <AbsoluteFill style={{background: C.black}} />;
	const n = 3 - Math.floor(frame / 12);
	const sweep = ((frame % 12) / 12) * 360;
	const cx = width / 2;
	const cy = height / 2;
	const R = Math.hypot(width, height);
	const a = ((sweep - 90) * Math.PI) / 180;
	const large = sweep > 180 ? 1 : 0;
	return (
		<AbsoluteFill style={{background: '#a3a3a3'}}>
			<Stage>
				<path d={`M ${cx} ${cy} L ${cx} ${cy - R} A ${R} ${R} 0 ${large} 1 ${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R} Z`} fill="#6a6a6a" />
				<line x1={0} x2={width} y1={cy} y2={cy} stroke="#111" strokeWidth={4} />
				<line y1={0} y2={height} x1={cx} x2={cx} stroke="#111" strokeWidth={4} />
				<circle cx={cx} cy={cy} r={330} fill="none" stroke="#f2f2f2" strokeWidth={10} />
				<circle cx={cx} cy={cy} r={290} fill="none" stroke="#f2f2f2" strokeWidth={6} />
				<text x={cx} y={cy + 150} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={440} fill="#111">
					{n}
				</text>
			</Stage>
		</AbsoluteFill>
	);
};

// ================================================================ 0:01 presents

/** The glyph, but the waves actually move. */
export const LiveGlyph: React.FC<{size: number; color?: string; amp?: number; style?: React.CSSProperties}> = ({size, color = C.paper, amp = 1, style}) => {
	const frame = useCurrentFrame();
	return (
		<svg viewBox="32.9 31.1 86 86" width={size} height={size} style={{overflow: 'visible', ...style}}>
			<g fill={color}>
				{WAVES.map((d, i) => (
					<path
						key={d}
						d={d}
						transform={`translate(${Math.sin(frame * 0.12 + i * 1.1) * 2.2 * amp} ${Math.sin(frame * 0.09 + i * 0.8) * 1.3 * amp})`}
					/>
				))}
			</g>
		</svg>
	);
};

export const Presents: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - 2, fps, config: {damping: 12, mass: 0.6}});
	return (
		<Backdrop>
			<Center style={{gap: 36}}>
				<LiveGlyph size={250} style={{transform: `scale(${s})`}} />
				<div
					style={{
						fontFamily: F.display,
						fontWeight: 700,
						fontSize: 104,
						letterSpacing: 26,
						marginRight: -26,
						color: C.paper,
						opacity: interpolate(frame, [10, 22], [0, 1], clamp),
					}}
				>
					{TITLE.presentsBrand}
				</div>
				<div
					style={{
						fontFamily: F.serif,
						fontStyle: 'italic',
						fontWeight: 500,
						fontSize: 64,
						color: C.light,
						marginTop: -18,
						opacity: interpolate(frame, [22, 34], [0, 1], clamp),
					}}
				>
					{TITLE.presents}
				</div>
			</Center>
		</Backdrop>
	);
};

// ================================================================ 0:03 title

export const Title: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const word = TITLE.title[1].split('');
	// letters arrive riding a wave, then keep a gentle ripple
	const settle = interpolate(frame, [0, 40], [1, 0.18], clamp);
	const trace = interpolate(frame, [18, 54], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const traceW = 760;
	const pts: string[] = [];
	for (let i = 0; i <= 200 * trace; i++) {
		const x = i / 200;
		pts.push(`${x * traceW},${Math.sin(x * Math.PI * 10 - frame * 0.25) * 16 * (1 - x * 0.6)}`);
	}
	return (
		<Backdrop>
			<Stage>
				<Rings cx={width / 2} cy={height * 0.42} speed={1.6} opacity={0.22} />
			</Stage>
			<Center style={{marginTop: -height * 0.1}}>
				<div style={{opacity: interpolate(frame, [0, 10], [0, 1], clamp)}}>
					<StarRule width={720} />
				</div>
				<div
					style={{
						fontFamily: F.display,
						fontWeight: 500,
						fontSize: 96,
						letterSpacing: 30,
						marginRight: -30,
						color: C.light,
						marginTop: 34,
						lineHeight: 1,
						opacity: interpolate(frame, [2, 12], [0, 1], clamp),
					}}
				>
					{TITLE.title[0]}
				</div>
				<div style={{display: 'flex', fontFamily: F.display, fontWeight: 700, fontSize: 178, letterSpacing: 6, color: C.paper, lineHeight: 1.05}}>
					{word.map((ch, i) => {
						const pop = spring({frame: frame - 4 - i * 2, fps, config: {damping: 10, mass: 0.5}});
						const y = Math.sin(frame * 0.3 - i * 0.7) * 34 * settle;
						return (
							<span key={i} style={{display: 'inline-block', transform: `translateY(${y + (1 - pop) * 120}px) scale(${pop})`, opacity: pop}}>
								{ch}
							</span>
						);
					})}
				</div>
				<svg width={traceW} height={50} viewBox={`0 -25 ${traceW} 50`} style={{overflow: 'visible', marginTop: 6}}>
					<polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={10} opacity={0.2} />
					<polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={4} />
				</svg>
				<div
					style={{
						opacity: interpolate(frame, [40, 56], [0, 1], clamp),
						marginTop: 36,
						width: 760,
						textAlign: 'center',
						fontFamily: F.serif,
						fontStyle: 'italic',
						fontWeight: 500,
						fontSize: 52,
						lineHeight: 1.2,
						color: C.light,
					}}
				>
					{TITLE.subtitle}
				</div>
			</Center>
		</Backdrop>
	);
};

// ================================================================ 0:06 history

/** A painted stick figure (cave wall, vase). */
const Stick: React.FC<{x: number; y: number; s: number; color: string; up: number; hat?: boolean; clip?: boolean; w?: number}> = ({
	x,
	y,
	s,
	color,
	up,
	hat,
	clip,
	w = 7,
}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none">
		<line x1={0} y1={-60} x2={0} y2={-25} />
		<line x1={0} y1={-25} x2={-14} y2={0} />
		<line x1={0} y1={-25} x2={14} y2={0} />
		{clip ? (
			<>
				<line x1={0} y1={-52} x2={-16} y2={-34} />
				<line x1={0} y1={-52} x2={14} y2={-42} />
				<rect x={12} y={-56} width={14} height={18} fill={color} stroke="none" />
			</>
		) : (
			<>
				<line x1={0} y1={-52} x2={-20} y2={-52 - 22 * up} />
				<line x1={0} y1={-52} x2={20} y2={-52 - 22 * (1 - up)} />
			</>
		)}
		<circle cx={0} cy={-72} r={10} fill={color} stroke="none" />
		{hat ? <path d="M -13 -76 Q -12 -92 0 -92 Q 12 -92 13 -76 Z M -17 -76 L 17 -76" fill={color} strokeWidth={4} /> : null}
	</g>
);

const EraTag: React.FC<{x: number; label: string; dark?: boolean}> = ({x, label, dark}) => (
	<g transform={`translate(${x} 150)`}>
		<rect x={-170} y={-36} width={340} height={64} fill={dark ? '#111' : '#f0efe9'} stroke={dark ? '#f0efe9' : '#111'} strokeWidth={4} />
		<text x={0} y={10} textAnchor="middle" fontFamily={F.mono} fontSize={30} letterSpacing={6} fill={dark ? '#f0efe9' : '#111'}>
			{label}
		</text>
	</g>
);

const Cave: React.FC<{W: number; H: number; f: number}> = ({W, H, f}) => {
	const ochre = '#e2cfae';
	const fire = (k: number) => 1 + Math.sin(f * 0.9 + k) * 0.12 + (random(`fi${f}${k}`) - 0.5) * 0.1;
	return (
		<g>
			<rect width={W} height={H} fill="#4f4842" />
			{Array.from({length: 40}, (_, i) => (
				<ellipse
					key={i}
					cx={random(`cvx${i}`) * W}
					cy={random(`cvy${i}`) * H}
					rx={60 + random(`cvr${i}`) * 180}
					ry={40 + random(`cvq${i}`) * 120}
					fill={random(`cvc${i}`) > 0.5 ? '#5d554e' : '#3f3934'}
					opacity={0.6}
				/>
			))}
			{/* firelight */}
			<circle cx={W * 0.45} cy={H * 0.72} r={420 * fire(0)} fill="#fff" opacity={0.08} />
			{/* hand prints */}
			{[
				[130, 360],
				[930, 300],
			].map(([hx, hy], i) => (
				<g key={i} transform={`translate(${hx} ${hy}) rotate(${i ? 20 : -15})`} fill={ochre} opacity={0.5}>
					<ellipse cx={0} cy={0} rx={30} ry={36} />
					{[-28, -12, 4, 20].map((fx, j) => (
						<rect key={j} x={fx} y={-80 + Math.abs(fx) * 0.4} width={13} height={50} rx={6} />
					))}
					<rect x={26} y={-30} width={13} height={40} rx={6} transform="rotate(40 30 -10)" />
				</g>
			))}
			{/* dancers round the fire */}
			{[0, 1, 2, 3, 4].map((i) => (
				<Stick key={i} x={W * 0.12 + i * 150} y={H * 0.74 + (i % 2) * 20} s={2.4} color={ochre} up={0.5 + 0.5 * Math.sin(f * 0.35 + i * 1.3)} />
			))}
			{/* the fire */}
			<g transform={`translate(${W * 0.45} ${H * 0.86})`} fill={ochre}>
				<path d={`M -50 0 Q -60 ${-90 * fire(1)} 0 ${-170 * fire(2)} Q 60 ${-90 * fire(3)} 50 0 Z`} />
				<path d={`M -24 0 Q -30 ${-50 * fire(4)} 0 ${-95 * fire(5)} Q 30 ${-50 * fire(6)} 24 0 Z`} fill="#4f4842" />
			</g>
			{/* someone at the edge, watching */}
			<Stick x={W * 0.86} y={H * 0.74} s={2.4} color={ochre} up={0} hat clip />
			<EraTag x={W / 2} label="LONG AGO" />
		</g>
	);
};

const meander = (x0: number, y: number, w: number, h: number, color: string) => {
	const unit = h;
	const n = Math.ceil(w / unit);
	const d: string[] = [];
	for (let i = 0; i < n; i++) {
		const x = x0 + i * unit;
		d.push(`M ${x} ${y + h} L ${x} ${y} L ${x + unit * 0.75} ${y} L ${x + unit * 0.75} ${y + h * 0.6} L ${x + unit * 0.35} ${y + h * 0.6} L ${x + unit * 0.35} ${y + h * 0.3}`);
	}
	return <path d={d.join(' ')} stroke={color} strokeWidth={h * 0.12} fill="none" />;
};

const Vase: React.FC<{W: number; H: number; f: number}> = ({W, H, f}) => {
	const terra = '#c49a6c';
	const blk = '#1a1410';
	const cx = W / 2;
	const top = H * 0.2;
	const bot = H * 0.9;
	const vase = `M ${cx - 140} ${top} Q ${cx - 150} ${top + 70} ${cx - 220} ${top + 150} Q ${cx - 470} ${H * 0.55} ${cx - 300} ${bot - 80} Q ${cx - 200} ${bot} ${cx - 120} ${bot} L ${cx + 120} ${bot} Q ${cx + 200} ${bot} ${cx + 300} ${bot - 80} Q ${cx + 470} ${H * 0.55} ${cx + 220} ${top + 150} Q ${cx + 150} ${top + 70} ${cx + 140} ${top} Z`;
	const bandY = H * 0.47;
	return (
		<g>
			<rect width={W} height={H} fill="#262626" />
			<defs>
				<clipPath id="vaseclip">
					<path d={vase} />
				</clipPath>
			</defs>
			<path d={vase} fill={terra} stroke={blk} strokeWidth={8} />
			<g clipPath="url(#vaseclip)">
				<rect x={0} y={top + 110} width={W} height={60} fill={blk} />
				{meander(0, top + 122, W, 36, terra)}
				<rect x={0} y={bot - 150} width={W} height={60} fill={blk} />
				{meander(0, bot - 138, W, 36, terra)}
				{/* black-figure dancers, holding hands in a line */}
				{[0, 1, 2, 3, 4].map((i) => {
					const x = cx - 360 + i * 135;
					const b = Math.sin(f * 0.3 + i) * 8;
					return (
						<g key={i} transform={`translate(${x} ${bandY + 190 + b})`} fill={blk} stroke={blk}>
							<circle cx={0} cy={-200} r={22} stroke="none" />
							<path d="M -26 -170 L 26 -170 L 40 -40 L -40 -40 Z" stroke="none" />
							<line x1={-14} y1={-40} x2={-30 + Math.sin(f * 0.3 + i) * 12} y2={20} strokeWidth={14} strokeLinecap="round" />
							<line x1={14} y1={-40} x2={30 - Math.sin(f * 0.3 + i) * 12} y2={20} strokeWidth={14} strokeLinecap="round" />
							<line x1={-22} y1={-160} x2={-75} y2={-125 - Math.sin(f * 0.3 + i) * 20} strokeWidth={11} strokeLinecap="round" />
							<line x1={22} y1={-160} x2={75} y2={-125 + Math.sin(f * 0.3 + i + 1) * 20} strokeWidth={11} strokeLinecap="round" />
						</g>
					);
				})}
				{/* and the one on the handle side, with a hard hat, taking notes */}
				<g transform={`translate(${cx + 330} ${bandY + 190})`} fill={blk} stroke={blk}>
					<circle cx={0} cy={-200} r={22} stroke="none" />
					<path d="M -26 -205 Q -26 -238 0 -238 Q 26 -238 26 -205 Z M -34 -207 L 34 -207 L 34 -199 L -34 -199 Z" stroke="none" />
					<path d="M -26 -170 L 26 -170 L 40 -40 L -40 -40 Z" stroke="none" />
					<line x1={-14} y1={-40} x2={-20} y2={20} strokeWidth={14} strokeLinecap="round" />
					<line x1={14} y1={-40} x2={20} y2={20} strokeWidth={14} strokeLinecap="round" />
					<rect x={-80} y={-150} width={42} height={56} stroke="none" />
					<line x1={-22} y1={-160} x2={-50} y2={-115} strokeWidth={11} strokeLinecap="round" />
				</g>
			</g>
			<EraTag x={W / 2} label="LESS LONG AGO" dark />
		</g>
	);
};

const Jazz: React.FC<{W: number; H: number; f: number; nod: number}> = ({W, H, f, nod}) => {
	const floor = H * 0.84;
	const t = f / 30;
	return (
		<g>
			<rect width={W} height={H} fill="#bcbcb6" />
			{/* deco fan */}
			{Array.from({length: 9}, (_, i) => (
				<circle key={i} cx={W / 2} cy={floor} r={900 - i * 90} fill={i % 2 ? '#a9a9a2' : '#c9c9c3'} stroke="#111" strokeWidth={4} />
			))}
			{Array.from({length: 13}, (_, i) => {
				const a = Math.PI + (Math.PI * i) / 12;
				return <line key={i} x1={W / 2} y1={floor} x2={W / 2 + Math.cos(a) * 900} y2={floor + Math.sin(a) * 900} stroke="#111" strokeWidth={4} />;
			})}
			<rect x={0} y={floor} width={W} height={H - floor} fill="#2b2b2b" />
			{[0, 1, 2].map((i) => (
				<Toon key={i} kind="dancer" hair={(i * 2) % 4 as 0 | 2} x={W * 0.18 + i * 230} y={floor + 10} s={1.25} pose={dance(t, 1 + i * 4, 1.2)} />
			))}
			<Toon x={W * 0.86} y={floor + 10} s={1.25} hold="clipboard" pose={{nod, brow: -1, mouth: 'flat', armR: [40, 70], look: -1}} />
			<EraTag x={W / 2} label="RECENTLY" />
		</g>
	);
};

export const History: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H} = useVideoConfig();
	const cam = interpolate(frame, [30, 50, 82, 102], [0, W, W, 2 * W], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const nod = interpolate(frame, [104, 112, 122], [0, 14, 0], clamp);
	return (
		<AbsoluteFill style={{background: C.black}}>
			<Stage>
				<defs>
					<clipPath id="panel">
						<rect width={W} height={H} />
					</clipPath>
				</defs>
				<g transform={`translate(${-cam} 0)`}>
					<g clipPath="url(#panel)">
						<Cave W={W} H={H} f={frame} />
					</g>
					<g transform={`translate(${W} 0)`}>
						<g clipPath="url(#panel)">
							<Vase W={W} H={H} f={frame} />
						</g>
					</g>
					<g transform={`translate(${2 * W} 0)`}>
						<g clipPath="url(#panel)">
							<Jazz W={W} H={H} f={frame} nod={nod} />
						</g>
					</g>
				</g>
			</Stage>
		</AbsoluteFill>
	);
};
