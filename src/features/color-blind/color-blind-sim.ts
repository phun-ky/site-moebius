import chroma from 'chroma-js';
import blinder from 'lib/blinder';

export const colorBlindSim = (color, type) => {
  const hex = chroma(color).hex();

  // Own properties only: `type` can come from the URL
  if (!Object.prototype.hasOwnProperty.call(blinder, type)) {
    return hex;
  }

  return blinder[type](hex);
};
