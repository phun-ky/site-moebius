import chroma from 'chroma-js';

export const difference = (
  colorA: string | chroma.Color,
  colorB: string | chroma.Color
): number => {
  return 0.5 * (chroma.deltaE(colorA, colorB) + chroma.deltaE(colorB, colorA));
};
