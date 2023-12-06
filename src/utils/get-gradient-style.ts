import { MoebiusColorValueHexType } from '@phun-ky/moebius';

export const getGradientStyle = (
  colors: MoebiusColorValueHexType[]
): void | string => {
  if (colors.length === 0) {
    throw new Error('Missing colors array for `gradient`');
  }

  const { MoebiusColor } = window;

  if (colors.length === 1) {
    return;
  }

  // Calculate start percentages for each color in the gradient.
  const startPercentage = colors.map(
    (color: MoebiusColorValueHexType, index: number) => {
      return Math.floor((100 / (colors.length + 1)) * (index + 1));
    }
  );
  // Create an array of RGB strings with corresponding start percentages.
  const rgbaStrings = colors
    .map((color: MoebiusColorValueHexType, index: number) => {
      const mColor = new MoebiusColor(color);
      const { r, g, b } = mColor.toObject('rgb');

      return `rgb(${r},${g},${b}) ${startPercentage[index]}%`;
    })
    .join(', ');

  return `background-image: linear-gradient(90deg, ${rgbaStrings});`;
};
