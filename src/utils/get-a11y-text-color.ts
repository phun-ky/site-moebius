import chroma from 'chroma-js';

/**
 * Pick black or white text for a background, whichever has the higher
 * contrast. Before, white was kept down to 5:1, which picked black for
 * mid-tones where black falls below WCAG AA's 4.5:1 and white does not.
 * @param {string} color - The background colour.
 * @returns {string} '#ffffff' or '#000000'.
 */
export const getA11yTextColor = (color: string): string =>
  chroma.contrast(color, '#ffffff') >= chroma.contrast(color, '#000000')
    ? '#ffffff'
    : '#000000';
