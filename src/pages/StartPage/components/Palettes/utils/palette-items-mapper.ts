import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { addOnAfterAppRender } from 'lib/spa';
import { PaletteItem } from '../components/PaletteItem';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { onColorClick } from 'utils/on-color-click';

export type MoebiusSitePaletteItemsMapperArgsType = {
  id: string;
  moebius: typeof window.MoebiusPalettes;
  options: MoebiusSiteDefaultOptionsType;
};

export const paletteItemsMapper = (
  args: MoebiusSitePaletteItemsMapperArgsType
) => {
  const { id, moebius, options } = args;
  const { MoebiusSVGHelper } = window;

  addOnAfterAppRender(() => {
    const svgHelper = new MoebiusSVGHelper();
    const element = document.querySelector(`#${id}-svg`);

    if (element) {
      element.innerHTML = '';

      const colors = moebius.colors[id].map((color: MoebiusColorValueHexType) =>
        moebius.monochromatic(color, { numberOfColors: 3 })
      );

      element.appendChild(svgHelper.getColorPiePaths(colors));

      const colorElements = element.querySelectorAll('path[data-color-hex]');

      if (colorElements && colorElements.length !== 0) {
        colorElements.forEach((element) => {
          element.removeEventListener('click', onColorClick);
          element.addEventListener('click', onColorClick);
        });
      }
    }
  });

  return {
    id,
    name: id,
    content: PaletteItem({ id, moebius, options })
  };
};
