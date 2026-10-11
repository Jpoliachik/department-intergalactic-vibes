// 9:16 for Reels/Stories: the 4:5 film, projected into a strip of film.
// Keeps every shot composed as drawn, and keeps the action clear of the app's
// own chrome at the top and bottom of the screen.
import React from 'react';
import {AbsoluteFill, Sequence, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Film, FilmProps} from './Film';
import {C, F, Glyph, PURPLE, TINT} from './look';

const FW = 1080;
const FH = 1350;

const Sprockets: React.FC<{x: number; H: number}> = ({x, H}) => {
	const pitch = 64;
	return (
		<>
			{Array.from({length: Math.ceil(H / pitch) + 1}, (_, i) => (
				<div
					key={i}
					style={{position: 'absolute', left: x, top: i * pitch + 14, width: 26, height: 36, borderRadius: 7, background: '#050505', boxShadow: 'inset 0 0 0 2px #2a2a2a'}}
				/>
			))}
		</>
	);
};

export const Vertical: React.FC<FilmProps> = (props) => {
	const frame = useCurrentFrame();
	const {width: W, height: H} = useVideoConfig();
	const top = Math.round((H - FH) / 2);
	const flicker = 0.92 + random(`vf${frame}`) * 0.08;
	return (
		<AbsoluteFill style={{background: '#161616'}}>
			{/* the strip */}
			<Sprockets x={14} H={H} />
			<Sprockets x={W - 40} H={H} />
			{/* title above the frame */}
			<div style={{position: 'absolute', top: top - 200, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: flicker}}>
				<Glyph size={64} color={PURPLE} style={{filter: TINT}} />
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 46, letterSpacing: 12, marginRight: -12, color: C.paper}}>A HIGHER FREQUENCY</div>
				<div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.mid}}>an informational film for prospective candidates</div>
			</div>

			{/* the projected frame */}
			<div style={{position: 'absolute', left: 0, top, width: FW, height: FH, overflow: 'hidden'}}>
				<Sequence width={FW} height={FH} layout="none">
					<Film {...props} />
				</Sequence>
			</div>

			{/* url below */}
			<div style={{position: 'absolute', top: top + FH + 70, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 34, letterSpacing: 8, color: C.light, opacity: flicker}}>
				vibecorp.live
			</div>
		</AbsoluteFill>
	);
};
