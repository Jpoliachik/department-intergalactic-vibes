// Every word the film says, and when it says it. Edit here; timings are in seconds.
// The narration is shown as subtitles until a voice track exists (see README).

export const FPS = 30;
export const DURATION_S = 60;

export const NARRATION: {from: number; to: number; text: string}[] = [
	{from: 5.0, to: 9.9, text: 'For as long as anyone can remember, someone has been watching the vibes.'},
	{from: 11.6, to: 14.6, text: 'That someone is us.'},
	{from: 15.5, to: 19.8, text: 'At VibeCorp\u2019s Department of Vibe Assessment,'},
	{from: 20.0, to: 25.0, text: 'our officers monitor the universe\u2019s frequencies \u2014 so you don\u2019t have to.'},
	{from: 25.2, to: 29.9, text: 'Every day, thousands of assessments. Calibrations. Readings.'},
	{from: 30.2, to: 34.6, text: 'The work is vital. The work is endless.'},
	{from: 35.4, to: 38.4, text: 'And we are always looking for more.'},
	{from: 38.6, to: 41.8, text: 'Individuals of rare frequency. People with good vibes.'},
	{from: 42.4, to: 48.6, text: 'Requirements are simple: a steady pulse, a discerning eye, and no fear of the hum.'},
	{from: 49.0, to: 53.6, text: 'If your frequency is true \u2014 we will find you.'},
	{from: 54.6, to: 57.8, text: 'VibeCorp. Your frequency has already been logged.'},
];

// Scene boundaries, in seconds. Order is playback order.
export const SCENES = {
	leader: [0, 1.4],
	presents: [1.4, 3.4],
	title: [3.4, 6.6],
	history: [6.6, 10.8],
	us: [10.8, 15.2],
	officer: [15.2, 20.2],
	cosmos: [20.2, 25.4],
	headline: [25.4, 27.8],
	calibrate: [27.8, 30.0],
	conveyor: [30.0, 35.0],
	search: [35.0, 42.0],
	join: [42.0, 44.4],
	requirements: [44.4, 48.8],
	radar: [48.8, 54.0],
	final: [54.0, 58.0],
	finePrint: [58.0, 60.0],
} as const;

// Story beats inside scenes, in seconds — matched to the narration.
export const BEATS = {
	hatTip: 12.0, // "That someone is us."
	hammock: 23.3, // "so you don't have to"
	readings: 29.0,
	endless: 32.6, // "The work is endless."
	rare: 38.6, // "Individuals of rare frequency"
	pulse: 45.3,
	eye: 46.5,
	hum: 47.6,
	found: 51.6, // "we will find you"
	logged: 57.0,
};

export const TITLE = {
	presentsBrand: 'VIBECORP',
	presents: 'presents',
	title: ['A HIGHER', 'FREQUENCY'],
	subtitle: 'an informational film for prospective candidates',
	join: ['JOIN THE', 'MOVEMENT'],
	requirements: ['A steady pulse', 'A discerning eye', 'No fear of the hum'],
	finalBrand: 'VIBECORP',
	url: 'vibecorp.live',
	finePrint: 'No further action is required at this time.',
};

// Lines on the inspection slip in the montage — straight from INSPECTION_REPORT.md.
export const SLIP_LINES = [
	'Verified human',
	'Frequency off the charts',
	'Permitted to get weird',
	'Suspected time traveler',
	'Claims this is a costume',
	'Too powerful. Reported to HQ.',
];
export const SLIP_TICKED = [1, 2];
