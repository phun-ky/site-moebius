import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { camelCase } from 'utils/camel-case';

/**
 * Converts an array of main colors and their accent colors to JavaScript code.
 * @param {MoebiusColorValueHexType[]} mainColors - Array of main colors.
 * @param {MoebiusColorValueHexType[][]} accentColors - Array of arrays representing accent colors for each main color.
 * @returns {string} JavaScript code for colors.
 * @example
 * ```ts
 * const colors = [
 *   '#ff0000', // Red
 *   '#00ff00', // Green
 *   // ...
 * ];
 * const accentsRed = [
 *   "#ff9999", // Light Red
 *   // ...
 * ];
 * const accentsGreen = [
 *   "#99ff99", // Light Green
 *   // ...
 * ];
 * ```
 */
export const js = (
  mainColors: MoebiusColorValueHexType[],
  accentColors: MoebiusColorValueHexType[][]
): string => {
  const { MoebiusColor } = window;
  const colors = mainColors
    .map((color: MoebiusColorValueHexType) => {
      const mColor = new MoebiusColor(color);
      const hex = mColor.hex;

      return `  '${hex}', // ${mColor.name}`;
    })
    .join(',\n');
  const accents =
    '\n' +
    `${accentColors
      .map((group, index) => {
        const groupName = new MoebiusColor(mainColors[index]).name;

        return (
          '\n' +
          `const ${camelCase(`accents ${groupName}`)} [\n` +
          `${group
            .map((color: MoebiusColorValueHexType) => {
              const mColor = new MoebiusColor(color);
              const hex = mColor.hex;

              return `  "${hex}", // ${mColor.name}`;
            })
            .join('\n')}\n` +
          ']'
        );
      })
      .join('\n')}`;

  return 'const colors = [\n' + `${colors}\n` + '];\n' + `${accents}`;
};
