import chroma from 'chroma-js';

// Colour vision deficiency simulation after Machado, Oliveira and Fernandes
// (2009), "A Physiologically-based Model for Simulation of Color Vision
// Deficiency", doi:10.1109/TVCG.2009.113. The matrices are the paper's
// supplementary data
// (http://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html),
// as published in colorspacious (MIT), and apply to linear RGB. Dichromacy
// ("-opia") uses severity 100, anomalous trichromacy ("-anomaly") severity 60.
// Achromatopsia is Rec. 709 luminance; achromatomaly is 60% of the way there.

type Matrix = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number]
];

const PROTAN_60: Matrix = [
  [0.38545, 0.769005, -0.154455],
  [0.100526, 0.829802, 0.069673],
  [-0.007442, -0.02219, 1.029632]
];
const PROTAN_100: Matrix = [
  [0.152286, 1.052583, -0.204868],
  [0.114503, 0.786281, 0.099216],
  [-0.003882, -0.048116, 1.051998]
];
const DEUTAN_60: Matrix = [
  [0.498864, 0.674741, -0.173604],
  [0.205199, 0.754872, 0.039929],
  [-0.011131, 0.030969, 0.980162]
];
const DEUTAN_100: Matrix = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881]
];
const TRITAN_60: Matrix = [
  [1.104996, -0.046633, -0.058363],
  [-0.032137, 0.971635, 0.060503],
  [0.001336, 0.317922, 0.680742]
];
const TRITAN_100: Matrix = [
  [1.255528, -0.076749, -0.178779],
  [-0.078411, 0.930809, 0.147602],
  [0.004733, 0.691367, 0.3039]
];
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
const ACHROMA_100: Matrix = [LUMINANCE, LUMINANCE, LUMINANCE];
/**
 * Move a fraction of the way from no change to a simulation matrix.
 * @param {Matrix} matrix - The full simulation.
 * @param {number} fraction - 0 is no change, 1 is the full simulation.
 * @returns {Matrix} The partial simulation.
 */
const partial = (matrix: Matrix, fraction: number): Matrix =>
  matrix.map((row, r) =>
    row.map((value, c) => (1 - fraction) * (r === c ? 1 : 0) + fraction * value)
  ) as unknown as Matrix;

export const SIMULATIONS = new Map<string, Matrix>([
  ['protanomaly', PROTAN_60],
  ['protanopia', PROTAN_100],
  ['deuteranomaly', DEUTAN_60],
  ['deuteranopia', DEUTAN_100],
  ['tritanomaly', TRITAN_60],
  ['tritanopia', TRITAN_100],
  ['achromatomaly', partial(ACHROMA_100, 0.6)],
  ['achromatopsia', ACHROMA_100]
]);

const toLinear = (channel: number): number => {
  const c = channel / 255;

  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (value: number): number => {
  const c = Math.min(1, Math.max(0, value));

  return Math.round(
    255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  );
};

/**
 * Simulate how a colour looks with a colour vision deficiency.
 * @param {string} color - Any colour chroma-js understands.
 * @param {string} type - One of the keys of SIMULATIONS; anything else,
 *   including 'normal', returns the colour unchanged.
 * @returns {string} The simulated colour as lowercase hex.
 */
export const simulate = (color: string, type: string): string => {
  const hex = chroma(color).hex();
  const matrix = SIMULATIONS.get(type);

  if (!matrix) return hex;

  const rgb = chroma(hex).rgb().map(toLinear);
  const [r, g, b] = matrix.map((row) =>
    fromLinear(row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2])
  );

  return chroma(r, g, b).hex();
};
