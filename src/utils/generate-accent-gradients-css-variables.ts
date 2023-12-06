import {
  MoebiusColorValueHexType,
  MoebiusPaletteAccentColorsInterface
} from '@phun-ky/moebius';

export const generateAccentGradientCssVariables = (
  accents: MoebiusPaletteAccentColorsInterface
): void => {
  const { MoebiusColor } = window;

  Object.keys(accents).forEach((id: string) => {
    const groups = accents[id];

    groups.forEach((colors: MoebiusColorValueHexType[], index: number) => {
      // Calculate start percentages for each color in the gradient.
      const startPercentage = colors.map(
        (color: MoebiusColorValueHexType, index: number) => {
          return Math.floor((100 / (colors.length + 1)) * (index + 1));
        }
      );
      const rgbaStrings = colors
        .map((color: MoebiusColorValueHexType, index: number) => {
          const mColor = new MoebiusColor(color);
          const { r, g, b } = mColor.toObject('rgb');

          return `rgb(${r},${g},${b}) ${startPercentage[index]}%`;
        })
        .join(',');

      document.documentElement.style.setProperty(
        `--moebius-accent-${id}-gradient-${index + 1}`,
        `linear-gradient(0deg, ${rgbaStrings})`
      );
    });
  });
};
