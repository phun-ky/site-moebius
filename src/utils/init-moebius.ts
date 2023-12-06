import Moebius from '@phun-ky/moebius';

export const initMoebius = async () => {
  if (window.MoebiusColor) return;

  const m = await Moebius();

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
