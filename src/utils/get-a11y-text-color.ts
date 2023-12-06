import chroma from 'chroma-js';

export const getA11yTextColor = (color: string): string =>
  chroma.contrast(color, '#ffffff') < 5 ? '#000000' : '#ffffff';
