import chroma from 'chroma-js';

export const difference = (colorA: string, colorB: string): number => {
  return 0.5 * (chroma.deltaE(colorA, colorB) + chroma.deltaE(colorB, colorA));
};
