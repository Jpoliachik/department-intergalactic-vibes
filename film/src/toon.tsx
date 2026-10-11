// The cartoon cast: a 1950s limited-animation rig (flat shapes, heavy outline,
// rubber-hose limbs, white gloves). One rig draws the crew member and the dancers.
import React from 'react';

export const INK = '#111';

type Arm = [number, number]; // [shoulder, elbow] degrees; 0 = hanging straight down, + = away from body
export type Pose = {
	armL?: Arm;
	armR?: Arm;
	legL?: number; // degrees, + = away from body
	legR?: number;
	nod?: number; // head pitch
	tilt?: number; // whole body lean
	mouth?: 'smile' | 'flat' | 'o' | 'grin';
	blink?: number; // 0 open .. 1 shut
	look?: number; // pupils, -1..1
	brow?: number; // -1 stern .. 1 raised
	bounce?: number; // squash, px
	hatLift?: number; // tip of the hat, px
};

export type ToonProps = {
	x: number;
	y: number;
	s?: number;
	flip?: boolean;
	kind?: 'crew' | 'dancer';
	hair?: 0 | 1 | 2 | 3;
	tone?: string; // body / outfit
	skin?: string;
	hold?: 'clipboard' | 'stamp' | 'tea' | null;
	pose?: Pose;
};

const rad = (d: number) => (d * Math.PI) / 180;

const limb = (pts: [number, number][], color: string, w = 11) => {
	const d = `M ${pts.map((p) => p.join(' ')).join(' L ')}`;
	return (
		<g fill="none" strokeLinecap="round" strokeLinejoin="round">
			<path d={d} stroke={INK} strokeWidth={w + 8} />
			<path d={d} stroke={color} strokeWidth={w} />
		</g>
	);
};

export const Toon: React.FC<ToonProps> = ({
	x,
	y,
	s = 1,
	flip = false,
	kind = 'crew',
	hair = 0,
	tone,
	skin = '#e9e6df',
	hold = null,
	pose = {},
}) => {
	const {
		armL = [12, 6],
		armR = [12, 6],
		legL = 6,
		legR = 6,
		nod = 0,
		tilt = 0,
		mouth = 'smile',
		blink = 0,
		look = 0,
		brow = 0,
		bounce = 0,
		hatLift = 0,
	} = pose;
	const crew = kind === 'crew';
	const body = tone ?? (crew ? '#8d8d8d' : '#cfcfcf');

	const arm = (side: -1 | 1, [a1, a2]: Arm): {pts: [number, number][]; hand: [number, number]; ang: number} => {
		const S: [number, number] = [side * 33, -150];
		const E: [number, number] = [S[0] + side * Math.sin(rad(a1)) * 42, S[1] + Math.cos(rad(a1)) * 42];
		const H: [number, number] = [E[0] + side * Math.sin(rad(a1 + a2)) * 38, E[1] + Math.cos(rad(a1 + a2)) * 38];
		return {pts: [S, E, H], hand: H, ang: side * (a1 + a2)};
	};
	const L = arm(-1, armL);
	const R = arm(1, armR);
	const leg = (side: -1 | 1, a: number): [number, number][] => {
		const Hp: [number, number] = [side * 15, -96];
		return [Hp, [Hp[0] + side * Math.sin(rad(a)) * 92, Hp[1] + Math.cos(rad(a)) * 92]];
	};
	const LL = leg(-1, legL);
	const LR = leg(1, legR);

	const glove = (h: [number, number]) => <circle cx={h[0]} cy={h[1]} r={12} fill="#fafafa" stroke={INK} strokeWidth={5} />;
	const shoe = (p: [number, number], side: -1 | 1) => (
		<ellipse cx={p[0] + side * 9} cy={p[1] - 4} rx={20} ry={10} fill={INK} />
	);

	const eyeRy = 11 * (1 - blink * 0.92);
	const px = look * 3.5;

	return (
		<g transform={`translate(${x} ${y - bounce}) scale(${flip ? -s : s} ${s}) rotate(${tilt} 0 -96)`}>
			{/* legs */}
			{limb(LL, crew ? '#5a5a5a' : '#3d3d3d', 13)}
			{limb(LR, crew ? '#5a5a5a' : '#3d3d3d', 13)}
			{shoe(LL[1], -1)}
			{shoe(LR[1], 1)}

			{/* arm behind */}
			{limb(L.pts, crew ? body : skin)}
			{glove(L.hand)}

			{/* torso */}
			<path
				d="M -36 -150 Q -36 -164 -22 -164 L 22 -164 Q 36 -164 36 -150 L 30 -96 Q 30 -88 22 -88 L -22 -88 Q -30 -88 -30 -96 Z"
				fill={body}
				stroke={INK}
				strokeWidth={5}
				strokeLinejoin="round"
			/>
			{crew ? (
				<g>
					<rect x={-34} y={-139} width={68} height={9} fill="#f6f6f2" stroke={INK} strokeWidth={2.5} />
					<rect x={-32} y={-115} width={64} height={9} fill="#f6f6f2" stroke={INK} strokeWidth={2.5} />
					<path d="M -10 -164 L 0 -145 L 10 -164" fill="#3a3a3a" stroke={INK} strokeWidth={3} />
				</g>
			) : (
				<path d="M -12 -164 Q 0 -150 12 -164" fill="none" stroke={INK} strokeWidth={3} />
			)}

			{/* head */}
			<g transform={`rotate(${nod} 0 -166)`}>
				{!crew && hair === 1 ? (
					<g fill="#2a2a2a" stroke={INK} strokeWidth={4}>
						{[[-34, -200], [34, -200], [-40, -228], [40, -228], [-24, -252], [24, -252], [0, -262]].map(([cx, cy]) => (
							<circle key={`${cx}${cy}`} cx={cx} cy={cy} r={22} />
						))}
						<circle cx={0} cy={-226} r={40} stroke="none" />
					</g>
				) : null}
				{!crew && hair === 2 ? (
					<path d="M 30 -228 Q 70 -220 64 -176 Q 52 -196 34 -200 Z" fill="#2a2a2a" stroke={INK} strokeWidth={4} />
				) : null}
				<rect x={-9} y={-176} width={18} height={14} fill={skin} stroke={INK} strokeWidth={4} />
				<circle cx={0} cy={-206} r={38} fill={skin} stroke={INK} strokeWidth={5} />
				{/* eyes */}
				{[-13, 13].map((ex) => (
					<g key={ex}>
						<ellipse cx={ex + px} cy={-210} rx={6.5} ry={Math.max(1.4, eyeRy)} fill={INK} />
						{blink < 0.5 ? <circle cx={ex + px + 2} cy={-214} r={2} fill="#fff" /> : null}
					</g>
				))}
				{/* brows */}
				<g stroke={INK} strokeWidth={4} strokeLinecap="round">
					<line x1={-20} y1={-226 - brow * 5 + (brow < 0 ? -3 : 0)} x2={-6} y2={-226 - brow * 5 + (brow < 0 ? 3 : 0)} />
					<line x1={6} y1={-226 - brow * 5 + (brow < 0 ? 3 : 0)} x2={20} y2={-226 - brow * 5 + (brow < 0 ? -3 : 0)} />
				</g>
				{/* mouth */}
				{mouth === 'smile' ? (
					<path d="M -12 -190 Q 0 -180 12 -190" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
				) : mouth === 'grin' ? (
					<path d="M -15 -192 Q 0 -174 15 -192 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
				) : mouth === 'o' ? (
					<ellipse cx={0} cy={-187} rx={6} ry={8} fill={INK} />
				) : (
					<line x1={-9} y1={-188} x2={9} y2={-188} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
				)}
				{/* headwear */}
				{crew ? (
					<g stroke={INK} strokeWidth={5} strokeLinejoin="round" transform={`translate(${hatLift * 0.3} ${-hatLift}) rotate(${-hatLift * 0.35} 30 -226)`}>
						<path d="M -36 -222 Q -36 -262 0 -262 Q 36 -262 36 -222 Z" fill="#f2f2ee" />
						<rect x={-46} y={-226} width={92} height={10} rx={5} fill="#f2f2ee" />
						<line x1={0} y1={-262} x2={0} y2={-226} strokeWidth={3} />
					</g>
				) : hair === 0 ? (
					<path d="M -38 -212 Q -40 -250 0 -248 Q 40 -250 38 -212 Q 20 -232 -38 -212 Z" fill="#2a2a2a" stroke={INK} strokeWidth={4} />
				) : hair === 3 ? (
					<g>
						<circle cx={0} cy={-252} r={16} fill="#2a2a2a" stroke={INK} strokeWidth={4} />
						<path d="M -38 -210 Q -36 -246 0 -244 Q 36 -246 38 -210 Q 0 -232 -38 -210 Z" fill="#2a2a2a" stroke={INK} strokeWidth={4} />
					</g>
				) : (
					<path d="M -38 -214 Q -30 -248 0 -246 Q 30 -248 38 -214 Q 10 -236 -38 -214 Z" fill="#2a2a2a" stroke={INK} strokeWidth={4} />
				)}
			</g>

			{/* arm in front, and whatever it holds */}
			{limb(R.pts, crew ? body : skin)}
			{hold === 'clipboard' ? (
				<g transform={`translate(${R.hand[0] + 8} ${R.hand[1] - 30}) rotate(-6)`}>
					<rect x={-26} y={-34} width={56} height={74} rx={4} fill="#f4f4f0" stroke={INK} strokeWidth={4} />
					<rect x={-10} y={-40} width={24} height={11} rx={3} fill="#555" stroke={INK} strokeWidth={3} />
					{[-14, -2, 10, 22].map((ly) => (
						<line key={ly} x1={-16} x2={20} y1={ly} y2={ly} stroke="#777" strokeWidth={3} />
					))}
				</g>
			) : null}
			{hold === 'stamp' ? (
				<g transform={`translate(${R.hand[0]} ${R.hand[1]})`}>
					<rect x={-9} y={-6} width={18} height={30} rx={4} fill="#555" stroke={INK} strokeWidth={4} />
					<rect x={-22} y={22} width={44} height={14} rx={3} fill="#333" stroke={INK} strokeWidth={4} />
				</g>
			) : null}
			{hold === 'tea' ? (
				<g transform={`translate(${R.hand[0]} ${R.hand[1] - 18})`}>
					<path d="M -14 -14 L 14 -14 L 10 16 L -10 16 Z" fill="#f4f4f0" stroke={INK} strokeWidth={4} />
					<line x1={6} y1={-14} x2={14} y2={-34} stroke={INK} strokeWidth={4} />
				</g>
			) : null}
			{glove(R.hand)}
		</g>
	);
};

/** A dancing pose that loops on `t` (seconds), different per `seed`. */
export const dance = (t: number, seed: number, energy = 1): Pose => {
	const p = t * Math.PI * 2 * (0.9 + (seed % 3) * 0.12) + seed * 1.3;
	const style = seed % 4;
	const up = (v: number) => v * energy;
	switch (style) {
		case 0: // arms up, swaying
			return {
				armL: [up(150 + Math.sin(p) * 20), 10],
				armR: [up(150 - Math.sin(p) * 20), 10],
				tilt: Math.sin(p) * 8 * energy,
				bounce: Math.abs(Math.sin(p)) * 14 * energy,
				legL: 8 + Math.max(0, Math.sin(p)) * 14,
				legR: 8 + Math.max(0, -Math.sin(p)) * 14,
				mouth: 'grin',
			};
		case 1: // the twist
			return {
				armL: [70 + Math.sin(p * 2) * 25, 70],
				armR: [70 - Math.sin(p * 2) * 25, 70],
				tilt: Math.sin(p * 2) * 10,
				legL: 14 + Math.sin(p * 2) * 8,
				legR: 14 - Math.sin(p * 2) * 8,
				bounce: Math.abs(Math.sin(p * 2)) * 8,
				mouth: 'smile',
			};
		case 2: // one fist pumping
			return {
				armL: [20, 20],
				armR: [up(140 + Math.sin(p * 2) * 30), -20 + Math.sin(p * 2) * 30],
				bounce: Math.max(0, Math.sin(p * 2)) * 16 * energy,
				legL: 6,
				legR: 6,
				tilt: -4,
				mouth: 'o',
			};
		default: // jazz hands
			return {
				armL: [up(100 + Math.sin(p) * 25), 40],
				armR: [up(100 + Math.cos(p) * 25), 40],
				bounce: Math.abs(Math.cos(p)) * 12 * energy,
				legL: 10 + Math.sin(p) * 10,
				legR: 10 - Math.sin(p) * 10,
				tilt: Math.cos(p) * 6,
				mouth: 'grin',
			};
	}
};

/** Walk cycle on `t` seconds. */
export const walk = (t: number): Pose => {
	const p = t * Math.PI * 2 * 1.6;
	return {
		legL: Math.sin(p) * 22,
		legR: -Math.sin(p) * 22,
		armL: [Math.max(-10, -Math.sin(p) * 22) + 8, 15],
		armR: [Math.max(-10, Math.sin(p) * 22) + 8, 15],
		bounce: Math.abs(Math.cos(p)) * 6,
	};
};
