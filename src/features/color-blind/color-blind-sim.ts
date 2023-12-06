import chroma from 'chroma-js';
import blinder from 'lib/blinder';

export const colorBlindSim = (color, type) => {
  return blinder[type](chroma(color).hex());
};
