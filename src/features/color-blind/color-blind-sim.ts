import { simulate } from './simulate';

/**
 * Simulate a colour for the colour-blind simulator setting.
 * @param {string} color - The colour.
 * @param {string} type - The simulation type; unknown types, including values
 *   from the URL that are not simulation types, return the colour unchanged.
 * @returns {string} The simulated colour as hex.
 */
export const colorBlindSim = (color: string, type: string): string =>
  simulate(color, type);
