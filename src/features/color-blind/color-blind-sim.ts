import chroma from 'chroma-js';
import blinder from 'lib/blinder';

export const colorBlindSim = (color, type) => {
  const hex = chroma(color).hex();

  // `type` can come from the URL: only call the simulator's own functions
  if (!Object.prototype.hasOwnProperty.call(blinder, type)) {
    return hex;
  }

  const simulate = blinder[type];

  if (typeof simulate !== 'function') {
    return hex;
  }

  return simulate(hex);
};
