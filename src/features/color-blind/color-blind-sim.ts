import chroma from 'chroma-js';
import blinder from 'lib/blinder';
import { COLOR_BLIND_SIM_TYPES } from 'utils/sanitize-options';

// `type` can come from the URL: look it up in a Map of the known simulation
// types instead of as a property of the simulator
const SIMULATORS = new Map(
  COLOR_BLIND_SIM_TYPES.filter(
    (type) => typeof blinder[type] === 'function'
  ).map((type) => [type, blinder[type]] as const)
);

export const colorBlindSim = (color, type) => {
  const hex = chroma(color).hex();
  const simulate = SIMULATORS.get(type);

  return typeof simulate === 'function' ? simulate(hex) : hex;
};
