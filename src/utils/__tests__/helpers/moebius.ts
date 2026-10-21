import Moebius from '@phun-ky/moebius';

// A few names, so tests can install the real moebius without a network
export const TEST_COLOR_NAMES = {
  'Deep Sea': '#003f5c',
  Orange: '#ff9900',
  'White Smoke': '#f5f5f5',
  Black: '#000000'
};

/**
 * Put the real moebius classes on window, as initMoebius does on the site.
 */
export const installMoebius = async (): Promise<void> => {
  const m = await Moebius({ colorNames: TEST_COLOR_NAMES });

  window.MoebiusColor = m.MoebiusColor;
  window.MoebiusPalettes = m.MoebiusPalettes;
  window.MoebiusSVGHelper = m.MoebiusSVGHelper;
};
