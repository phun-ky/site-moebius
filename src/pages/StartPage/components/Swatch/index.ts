import { colorBlindSim } from 'features/color-blind/color-blind-sim';

import { getA11yTextColor } from 'utils/get-a11y-text-color';

import { Color } from './components/Color';

import './styles/swatch.styl';

export const Swatch = (colors: string[], id: string, options) => {
  if (!colors || (colors && colors.length === 0)) return;

  if (!id || (id && id === '')) return;

  const { numberOfColors = 7, colorBlindSim: colorBlindSimType } = options;
  const { MoebiusColor } = window;

  let diff = 0;

  const ColorElements = colors.map((color) => {
    const mColor = new MoebiusColor(color);

    let backgroundColor = mColor.hex;
    let foregroundColor = getA11yTextColor(mColor.hex);

    if (colorBlindSimType !== 'normal') {
      const blindSimColor = colorBlindSim(mColor.hex, colorBlindSimType);

      backgroundColor = blindSimColor;
      foregroundColor = getA11yTextColor(blindSimColor);
    }

    return Color({
      color: mColor,
      text: mColor.hex,
      backgroundColor,
      foregroundColor
    });
  });

  let diffColorElements: string[] = [];

  if (colors.length < numberOfColors) {
    diff = numberOfColors - colors.length;

    const lastColor: string = colors[colors.length - 1];

    diffColorElements = [...new Array(diff)].map(() => {
      const mColor = new MoebiusColor(lastColor);

      return Color({
        color: mColor,
        className: 'no-color',
        text: 'No color',
        backgroundColor: lastColor,
        foregroundColor: getA11yTextColor(lastColor)
      });
    });
  }

  return [...ColorElements, ...diffColorElements].join('\n');
};
