import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Toon, dance, walk} from './toon';

// Scratch composition for checking the rig. Not part of the film.
export const Lab: React.FC = () => {
	const t = useCurrentFrame() / 30;
	return (
		<AbsoluteFill style={{background: '#bdbdb8'}}>
			<svg width={1080} height={1350}>
				<Toon x={200} y={600} hold="clipboard" pose={{nod: 10, brow: -1, mouth: 'flat', armR: [40, 70]}} />
				<Toon x={540} y={600} hold="stamp" pose={{...walk(t), mouth: 'grin', brow: 1}} />
				<Toon x={880} y={600} hold="tea" pose={{armR: [50, 90], blink: 1}} />
				{[0, 1, 2, 3].map((i) => (
					<Toon key={i} x={150 + i * 260} y={1150} kind="dancer" hair={i as 0 | 1 | 2 | 3} pose={dance(t, i)} />
				))}
			</svg>
		</AbsoluteFill>
	);
};
