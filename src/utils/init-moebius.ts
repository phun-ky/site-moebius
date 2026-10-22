import Moebius from '@phun-ky/moebius';

import { render } from 'lib/spa';
import { hideLoading } from 'utils/hide-loading';

const COLOR_NAMES_URL = '/data/colornames.json';

let colorNamesLoaded: Promise<void> | undefined;

const setMoebius = (m: Awaited<ReturnType<typeof Moebius>>): void => {
  window.MoebiusColor = m.MoebiusColor;
  window.MoebiusPalettes = m.MoebiusPalettes;
  window.MoebiusSVGHelper = m.MoebiusSVGHelper;
};
/**
 * Load the colour names after the first render, then render again with them.
 * Waiting for the 300 kB list before rendering made the start page slow on
 * phones (#82); until it arrives, colours have no names.
 * @returns {Promise<void>} Resolves once the names are in use, or failed.
 */
const loadColorNames = async (): Promise<void> => {
  try {
    setMoebius(await Moebius({ colorNames: COLOR_NAMES_URL }));
    await render();
  } catch (error) {
    // The palettes work without names; there is nowhere else to report this
    // eslint-disable-next-line no-console
    console.warn('Could not load colour names', error);
  }
};

/**
 * Put moebius on window, at first without colour names so the page can
 * render at once, and start loading the names.
 */
export const initMoebius = async (): Promise<void> => {
  if (window.MoebiusColor) return;

  setMoebius(await Moebius({ colorNames: false }));
  setTimeout(hideLoading, 1000);
  // Start once the first render is done, so the two renders never overlap
  colorNamesLoaded = new Promise<void>((resolve) =>
    document.addEventListener('eventAfterAppRender', () => resolve(), {
      once: true
    })
  ).then(loadColorNames);
};

/**
 * @returns {Promise<void>} Resolves when the colour names have loaded (or
 *   failed to), or at once if they are not loading.
 */
export const whenColorNamesLoaded = (): Promise<void> =>
  colorNamesLoaded ?? Promise.resolve();
