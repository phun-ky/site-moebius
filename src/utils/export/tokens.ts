import { MoebiusColorValueHexType } from '@phun-ky/moebius';

/**
 * A color as a design token value: its sRGB components, from 0 to 1, and
 * its hex code as the fallback.
 * @param {string} hex - A 6 digit hex color, such as `#003f5c`.
 * @returns {object} The token value.
 */
export const colorValue = (hex: string) => ({
  colorSpace: 'srgb',
  components: [1, 3, 5].map(
    (i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 1e4) / 1e4
  ),
  hex: hex.toLowerCase()
});

/**
 * The palette and its shades as design tokens, in the Design Tokens
 * Community Group format 2025.10 (#96), which design tools and token
 * pipelines read. Colors are numbered rather than named, because names
 * repeat (many shades are Black); each token's description is its name.
 * @param {MoebiusColorValueHexType[]} mainColors - The palette's colors.
 * @param {MoebiusColorValueHexType[][]} accentColors - Each color's shades.
 * @param {string} palette - The palette's name, such as `interpolate`.
 * @returns {string} The tokens, as JSON.
 */
export const tokens = (
  mainColors: MoebiusColorValueHexType[],
  accentColors: MoebiusColorValueHexType[][],
  palette: string
): string => {
  const { MoebiusColor } = window;
  const token = (color: MoebiusColorValueHexType) => {
    const mColor = new MoebiusColor(color);

    return {
      $value: colorValue(mColor.hex),
      // Empty until the color names have loaded
      ...(mColor.name ? { $description: mColor.name } : {})
    };
  };
  const numbered = <T>(items: T[], map: (item: T) => unknown) =>
    Object.fromEntries(items.map((item, i) => [String(i + 1), map(item)]));

  return JSON.stringify(
    {
      $description: `The ${palette} palette from moebius, https://moebius.wtf`,
      $type: 'color',
      [palette]: {
        ...numbered(mainColors, token),
        shades: numbered(accentColors, (group) => numbered(group, token))
      }
    },
    null,
    2
  );
};
