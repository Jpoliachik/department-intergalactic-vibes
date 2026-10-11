// Short cuts of the film. Each is a timeline written by scripts/cut.py: where
// every scene sits, and a warped clock that plays the 60s design faster (or
// slower) so each beat still lands on the word that calls it.
import {SCENES} from '../copy';
import cut30 from './cut30.json';

export type SceneKey = keyof typeof SCENES;

export type Cut = {
	name: string;
	duration: number;
	narration: string;
	music: string;
	scenes: Record<SceneKey, [number, number]>;
	/** per scene: [cut-local seconds, design-local seconds], increasing in both. Absent for a dropped scene. */
	anchors: Partial<Record<SceneKey, [number, number][]>>;
	lines: {from: number; to: number; text: string}[];
	cues: Record<string, number>;
};

export const CUTS: Record<string, Cut> = {
	cut30: cut30 as unknown as Cut,
};

const lerpThrough = (pts: [number, number][], x: number, from: 0 | 1, to: 0 | 1) => {
	if (x <= pts[0][from]) return pts[0][to] + (x - pts[0][from]);
	for (let i = 1; i < pts.length; i++) {
		const [a, b] = [pts[i - 1], pts[i]];
		if (x <= b[from]) return a[to] + ((x - a[from]) / (b[from] - a[from])) * (b[to] - a[to]);
	}
	const last = pts[pts.length - 1];
	return last[to] + (x - last[from]);
};

/** Cut-local seconds → design-local seconds, for one scene. */
export const toDesign = (cut: Cut, scene: SceneKey, t: number) => lerpThrough(cut.anchors[scene] ?? [[0, 0]], t, 0, 1);

/** Any 60s design time → its time in the cut (for foley cues). */
export const designToCut = (cut: Cut, t60: number) => {
	const keys = Object.keys(SCENES) as SceneKey[];
	const scene = keys.find((k) => t60 >= SCENES[k][0] && t60 < SCENES[k][1]) ?? keys[keys.length - 1];
	if (!cut.anchors[scene]) return NaN; // that scene isn't in this cut
	const local = lerpThrough(cut.anchors[scene]!, t60 - SCENES[scene][0], 1, 0);
	return cut.scenes[scene][0] + local;
};
