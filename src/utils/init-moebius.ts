import Moebius from '@phun-ky/moebius';

export const initMoebius = async () => {
  if (window.MoebiusColor) return;

  // Served from this site, built from color-name-list by
  // scripts/build-color-names.mjs, instead of fetched from a third party
  const m = await Moebius({ colorNames: '/data/colornames.json' });

  setTimeout(() => {
    const loadingElement = document.querySelector('.ph.loading');

    if (loadingElement) {
      loadingElement.classList.remove('is-loading');
    }
  }, 1000);

  window.MoebiusColor = m.MoebiusColor;
  window.MoebiusPalettes = m.MoebiusPalettes;
  window.MoebiusSVGHelper = m.MoebiusSVGHelper;
};
