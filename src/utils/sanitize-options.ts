import type { MoebiusSiteDefaultOptionsType } from 'config/constants';

export const COLOR_SCALE_MODES = ['rgb', 'lab', 'lrgb', 'hsl', 'lch'];

export const COLOR_BLIND_SIM_TYPES = [
  'normal',
  'protanomaly',
  'protanopia',
  'deuteranomaly',
  'deuteranopia',
  'tritanomaly',
  'tritanopia',
  'achromatomaly',
  'achromatopsia'
];

// The palettes moebius makes, in the order the page lists them
export const PALETTE_TYPES = [
  'interpolate',
  'luminanceShift',
  'monochromatic',
  'complement',
  'split',
  'triadic',
  'tetradic',
  'pentadic',
  'hexadic',
  'analogous'
];

export const MIN_NUMBER_OF_COLORS = 2;

export const MAX_NUMBER_OF_COLORS = 32;

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const COLOR_KEYS = ['baseColor', 'secondaryColor', 'divergentColor'];
const BOOLEAN_KEYS = [
  'diverging',
  'bezier',
  'reverseDirection',
  'randomOffset',
  'correctLightness',
  'noDuplicates'
];

/**
 * Keep only known options with valid values.
 *
 * Options come from the `#options=` URL hash, which anyone can craft, and end
 * up in HTML templates and property lookups. Unknown keys and invalid values
 * are dropped, so the defaults apply instead.
 * @param {unknown} input - The parsed hash value.
 * @returns {MoebiusSiteDefaultOptionsType} - The valid options only.
 */
export const sanitizeOptions = (
  input: unknown
): MoebiusSiteDefaultOptionsType => {
  const options: Record<string, unknown> = {};

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return options;
  }

  // Own properties only, so keys like `__proto__` or `constructor` never
  // resolve to something inherited
  const own = (key: string): unknown =>
    Object.prototype.hasOwnProperty.call(input, key)
      ? (input as Record<string, unknown>)[key]
      : undefined;

  for (const key of COLOR_KEYS) {
    const value = own(key);

    if (typeof value === 'string' && HEX_COLOR.test(value)) {
      options[key] = value;
    }
  }

  for (const key of BOOLEAN_KEYS) {
    const value = own(key);

    if (typeof value === 'boolean') {
      options[key] = value;
    }
  }

  const colorScaleMode = own('colorScaleMode');

  if (
    typeof colorScaleMode === 'string' &&
    COLOR_SCALE_MODES.includes(colorScaleMode)
  ) {
    options.colorScaleMode = colorScaleMode;
  }

  const colorBlindSim = own('colorBlindSim');

  if (
    typeof colorBlindSim === 'string' &&
    COLOR_BLIND_SIM_TYPES.includes(colorBlindSim)
  ) {
    options.colorBlindSim = colorBlindSim;
  }

  const palette = own('palette');

  if (typeof palette === 'string' && PALETTE_TYPES.includes(palette)) {
    options.palette = palette;
  }

  const numberOfColors = own('numberOfColors');

  if (
    typeof numberOfColors === 'number' &&
    Number.isInteger(numberOfColors) &&
    numberOfColors >= MIN_NUMBER_OF_COLORS &&
    numberOfColors <= MAX_NUMBER_OF_COLORS
  ) {
    options.numberOfColors = numberOfColors;
  }

  return options;
};

/**
 * Read and validate the options stored in the `#options=` URL hash.
 * @returns {MoebiusSiteDefaultOptionsType} - The valid options, or `{}`.
 */
export const readHashOptions = (): MoebiusSiteDefaultOptionsType => {
  try {
    const url = new URL(window.location.href);

    return sanitizeOptions(JSON.parse(atob(url.hash.replace('#options=', ''))));
  } catch {
    return {};
  }
};
