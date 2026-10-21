import Moebius from '@phun-ky/moebius';

import { hideLoading } from 'utils/hide-loading';

export const initMoebius = async () => {
  if (window.MoebiusColor) return;

  // Served from this site, built from color-name-list by
  // scripts/build-color-names.mjs, instead of fetched from a third party
  const m = await Moebius({ colorNames: '/data/colornames.json' });

  setTimeout(hideLoading, 1000);

  window.MoebiusColor = m.MoebiusColor;
  window.MoebiusPalettes = m.MoebiusPalettes;
  window.MoebiusSVGHelper = m.MoebiusSVGHelper;
};
