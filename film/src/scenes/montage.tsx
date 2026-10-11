import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS} from '../copy';
import {Digits, Stage, Sunburst, at, clamp} from '../kit';
import {C, F, Glyph} from '../look';
import {INK, Toon} from '../toon';

// ================================================================ 0:25 the spinning headline

export const Headline: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const p = interpolate(frame, [0, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const land = spring({frame: frame - 20, fps, config: {damping: 8, mass: 0.5}});
	const push = interpolate(frame, [22, 72], [1, 1.06], clamp);
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<Stage>
				<Sunburst cx={W / 2} cy={H / 2} spin={frame * 0.6} a="#262626" />
			</Stage>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 800,
						background: '#ebebeb',
						color: '#111',
						padding: '40px 46px 50px',
						boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
						transform: `rotate(${(1 - p) * 900 - 4 + (1 - land) * 3}deg) scale(${p * push})`,
						marginTop: -H * 0.06,
					}}
				>
					<div style={{textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 84, lineHeight: 1, letterSpacing: 1}}>The Daily Frequency</div>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							borderTop: '4px solid #111',
							borderBottom: '2px solid #111',
							marginTop: 16,
							padding: '8px 0',
							fontFamily: F.mono,
							fontSize: 20,
							letterSpacing: 2,
						}}
					>
						<span>EDITION: ONGOING</span>
						<span>PRICE: GOOD VIBES</span>
					</div>
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 132, lineHeight: 0.98, textAlign: 'center', marginTop: 18, letterSpacing: 1}}>
						THOUSANDS ASSESSED!
					</div>
					<div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 40, textAlign: 'center', marginTop: 10}}>
						Vibes found to be &ldquo;mostly excellent&rdquo;
					</div>
					<div style={{display: 'flex', gap: 26, marginTop: 24}}>
						<div style={{width: 280, height: 230, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Glyph size={170} color="#ddd" />
						</div>
						<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 13, paddingTop: 6}}>
							{Array.from({length: 11}, (_, i) => (
								<div key={i} style={{height: 8, background: '#9a9a96', width: `${70 + random(`hl${i}`) * 30}%`}} />
							))}
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ================================================================ 0:27 calibrations, readings

export const Calibrate: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const readings = at('calibrate', BEATS.readings, fps);
	const turn = interpolate(frame, [4, 32], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const noise = 1 - turn;
	const mx = W * 0.6;
	const my = H * 0.24;
	const sw = 470;
	const sh = 300;
	const pts: string[] = [];
	for (let i = 0; i <= 120; i++) {
		const x = i / 120;
		const v = Math.sin(x * Math.PI * 6 - frame * 0.3) * 0.6 + noise * (random(`n${frame}-${i}`) - 0.5) * 1.6;
		pts.push(`${mx - sw / 2 + 20 + x * (sw - 40)},${my + 60 + sh / 2 + v * sh * 0.35}`);
	}
	const tape = interpolate(frame, [readings, readings + 28], [0, 1], clamp);
	const tapeLen = tape * 560;
	const tapePts: string[] = [];
	for (let i = 0; i <= 60; i++) {
		const u = i / 60;
		tapePts.push(`${18 + Math.sin(u * Math.PI * 9) * 12},${u * tapeLen}`);
	}
	const floor = H * 0.86;
	const knobA = turn * 300 + Math.sin(frame * 0.5) * (1 - turn) * 6;
	return (
		<AbsoluteFill style={{background: '#bdbdb7'}}>
			<Stage>
				<rect x={0} y={floor} width={W} height={H - floor} fill="#3a3a3a" />
				{/* the junction box */}
				<g>
					<rect x={mx - 300} y={my - 40} width={600} height={floor - my + 40} rx={20} fill="#7c7c78" stroke={INK} strokeWidth={8} />
					<text x={mx} y={my + 22} textAnchor="middle" fontFamily={F.mono} fontSize={28} letterSpacing={6} fill="#111">
						GRID JUNCTION
					</text>
					<rect x={mx - sw / 2} y={my + 60} width={sw} height={sh} rx={40} fill="#151515" stroke={INK} strokeWidth={8} />
					<polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={12} opacity={0.2} />
					<polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={5} />
					{/* the big knob */}
					<g transform={`translate(${mx - 140} ${my + 500}) rotate(${knobA})`}>
						<circle r={70} fill="#e8e8e2" stroke={INK} strokeWidth={8} />
						{Array.from({length: 12}, (_, i) => (
							<line key={i} x1={0} y1={-70} x2={0} y2={-56} stroke={INK} strokeWidth={5} transform={`rotate(${i * 30})`} />
						))}
						<rect x={-6} y={-60} width={12} height={40} fill={INK} />
					</g>
					<text x={mx - 140} y={my + 610} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing={3} fill="#111">
						CALIBRATE
					</text>
					{/* lamps */}
					{[0, 1, 2].map((i) => {
						const on = turn > 0.95 || Math.sin(frame * 0.7 + i * 2) > 0.2;
						return <circle key={i} cx={mx + 60 + i * 70} cy={my + 470} r={20} fill={on ? '#fff' : '#333'} stroke={INK} strokeWidth={5} />;
					})}
					{/* the printer slot on the side, and the reading curling out of it */}
					<rect x={mx + 290} y={my + 440} width={22} height={70} rx={6} fill={INK} />
					<g transform={`translate(${mx + 300} ${my + 452}) rotate(${12 + tape * 10})`}>
						<rect x={0} y={0} width={tapeLen * 0.45} height={46} fill="#f4f4f0" stroke={INK} strokeWidth={3} />
						<polyline points={tapePts.map((pt) => pt.split(',')).map(([x, y]) => `${Number(y) * 0.45},${23 + (Number(x) - 18) * 1.3}`).join(' ')} fill="none" stroke={INK} strokeWidth={3} />
					</g>
				</g>
				<Toon x={W * 0.24} y={floor + 6} s={1.5} pose={{armR: [92, -4 + Math.sin(frame * 0.5) * 6], armL: [20, 10], brow: -0.6, mouth: turn > 0.95 ? 'smile' : 'flat', look: 1}} />
			</Stage>
		</AbsoluteFill>
	);
};

// ================================================================ 0:30 the work is vital; the work is endless

const beltSpeed = (f: number, endless: number) => 5 + (f > endless ? 0.011 * (f - endless) ** 2 : 0);
const beltTravel = (frame: number, endless: number) => {
	let travel = 0;
	for (let f = 0; f < frame; f++) travel += beltSpeed(f, endless);
	return travel;
};

/** Frames (within the conveyor scene) at which a slip passes under the stamp — for the foley. */
export const stampFrames = (W: number, durationInFrames: number, fps: number) => {
	const endless = at('conveyor', BEATS.endless, fps);
	// a slip's centre sits under the stamp when travel ≡ (X0 + 300 - SLIP_W/2) mod GAP
	const phase = (((W * 0.5 + 300 - SLIP_W / 2) % GAP) + GAP) % GAP;
	const out: number[] = [];
	let prev = Math.floor((beltTravel(0, endless) - phase) / GAP);
	for (let f = 1; f < durationInFrames; f++) {
		const k = Math.floor((beltTravel(f, endless) - phase) / GAP);
		if (k !== prev) out.push(f);
		prev = k;
	}
	return out;
};

const SLIP_W = 150;
const SLIP_H = 105;
const GAP = 230;

export const Conveyor: React.FC = () => {
	const frame = useCurrentFrame();
	const {width: W, height: H, fps} = useVideoConfig();
	const endless = at('conveyor', BEATS.endless, fps);
	const travel = beltTravel(frame, endless);
	const v = beltSpeed(frame, endless);

	const beltTop = H * 0.6;
	const beltH = 130;
	const s = 1.85;
	// stamp-hand geometry from the rig: arm [20,20] puts the stamp face at (71.8, -45.4) * s
	const X0 = W * 0.5;
	const cx = X0 - 71.8 * s;
	const stampY = beltTop + beltH / 2;
	const cy = stampY + 45.4 * s;

	const n = Math.ceil((W + 600) / GAP);
	const slips = Array.from({length: n}, (_, i) => {
		const x = ((i * GAP + travel) % (n * GAP)) - 300;
		const id = Math.floor((i * GAP + travel) / (n * GAP)) * n + i;
		return {x, id};
	});
	const down = Math.max(...slips.map((sl) => Math.exp(-(((sl.x + SLIP_W / 2 - X0) / (24 + v * 1.6)) ** 2))));
	const frantic = interpolate(frame, [endless, endless + 50], [0, 1], clamp);
	const stamped = Math.floor(travel / GAP);
	const hatOff = interpolate(frame, [140, 150], [0, 260], clamp);

	return (
		<AbsoluteFill style={{background: '#c4c4be'}}>
			<Stage>
				<defs>
					<clipPath id="behindBelt">
						<rect x={0} y={0} width={W} height={beltTop + 6} />
						<rect x={cx + 45 * s} y={0} width={200} height={H} />
					</clipPath>
				</defs>
				{/* the counter on the wall */}
				<foreignObject x={W / 2 - 300} y={H * 0.08} width={600} height={220}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
						<div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: 6, color: '#111'}}>ASSESSMENTS TODAY</div>
						<Digits value={48210 + Math.floor(travel * 1.7) + stamped * 11} size={110} />
					</div>
				</foreignObject>
				{/* belt */}
				<path d={`M 0 ${beltTop} L ${W} ${beltTop} L ${W} ${beltTop + beltH} L 0 ${beltTop + beltH} Z`} fill="#5a5a5a" stroke={INK} strokeWidth={6} />
				{Array.from({length: 16}, (_, i) => {
					const x = ((i * 90 + travel) % 1440) - 180;
					return <line key={i} x1={x} x2={x - 20} y1={beltTop + 6} y2={beltTop + beltH - 6} stroke="#444" strokeWidth={4} />;
				})}
				<rect x={0} y={beltTop + beltH} width={W} height={70} fill="#2e2e2e" stroke={INK} strokeWidth={6} />
				{Array.from({length: 9}, (_, i) => (
					<g key={i} transform={`translate(${60 + i * 125} ${beltTop + beltH + 35}) rotate(${travel * 2})`}>
						<circle r={26} fill="#888" stroke={INK} strokeWidth={5} />
						<line x1={-20} x2={20} y1={0} y2={0} stroke={INK} strokeWidth={4} />
					</g>
				))}
				<rect x={0} y={beltTop + beltH + 70} width={W} height={H} fill="#3a3a3a" />
				{/* the slips */}
				{slips.map(({x, id}) => {
					const done = x + SLIP_W / 2 > X0;
					return (
						<g key={id} transform={`translate(${x} ${beltTop + (beltH - SLIP_H) / 2}) skewX(-8)`}>
							{v > 14 ? <rect x={-v * 2.2} y={10} width={v * 2} height={SLIP_H - 20} fill="#fff" opacity={0.25} /> : null}
							<rect width={SLIP_W} height={SLIP_H} fill="#f4f4f0" stroke={INK} strokeWidth={4} />
							{[22, 42, 62].map((ly) => (
								<line key={ly} x1={16} x2={SLIP_W - 50} y1={ly} y2={ly} stroke="#999" strokeWidth={4} />
							))}
							{done ? (
								<g transform={`translate(${SLIP_W - 44} ${SLIP_H - 40}) rotate(-14)`}>
									<rect x={-30} y={-20} width={64} height={40} rx={8} fill="none" stroke={INK} strokeWidth={5} />
									<text x={2} y={9} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={24} fill={INK}>
										OK
									</text>
								</g>
							) : null}
						</g>
					);
				})}
				{/* the crew member, behind the belt, stamping */}
				<g clipPath="url(#behindBelt)">
					<Toon
						x={cx}
						y={cy}
						s={s}
						hold="stamp"
						pose={{
							armR: [20 + (1 - down) * 60, 20 + (1 - down) * 40],
							armL: [20 + frantic * 60 + Math.sin(frame * 0.9) * 20 * frantic, 30],
							mouth: frantic > 0.4 ? 'o' : 'smile',
							brow: frantic > 0.4 ? 1 : 0,
							look: frantic > 0.4 ? -1 : 0,
							hatLift: hatOff,
							tilt: Math.sin(frame * 1.3) * 4 * frantic,
						}}
					/>
				</g>
				{/* sweat */}
				{frantic > 0.3
					? [0, 1].map((k) => {
							const p = ((frame * 2 + k * 15) % 30) / 30;
							return <path key={k} d="M 0 -18 Q 10 0 0 8 Q -10 0 0 -18 Z" fill="#fff" stroke={INK} strokeWidth={3} transform={`translate(${cx + (k ? 70 : -70) * s} ${cy - 230 * s + p * 60})`} opacity={1 - p} />;
						})
					: null}
			</Stage>
		</AbsoluteFill>
	);
};
