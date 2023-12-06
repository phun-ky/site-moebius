import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { camelCase } from 'utils/camel-case';

export const css = (
  mainColors: MoebiusColorValueHexType[],
  accentColors: MoebiusColorValueHexType[][],
  accentType?: string
): string => {
  const { MoebiusColor } = window;
  const colors = mainColors
    .map((color: MoebiusColorValueHexType) => {
      const mColor = new MoebiusColor(color);
      const hex = mColor.hex;

      return `  --color-${camelCase(mColor.name)}: ${hex};`;
    })
    .join('\n');

  let types = '';

  if (accentType && accentType !== '') {
    types =
      '\n' +
      '/**\n' +
      ' * Inherited\n' +
      ' */\n' +
      `${mainColors
        .map((color: MoebiusColorValueHexType, index: number) => {
          const mColor = new MoebiusColor(color);

          return `  --color-${camelCase(accentType)}-${
            index + 1
          }: var(--color-${camelCase(mColor.name)});`;
        })
        .join('\n')}`;
  }

  const accents =
    '\n' +
    `${accentColors
      .map((group, index) => {
        const groupName = new MoebiusColor(mainColors[index]).name;

        return (
          '\n' +
          `.accents-${camelCase(groupName)}` +
          ` {\n ${group
            .map((color: MoebiusColorValueHexType) => {
              const mColor = new MoebiusColor(color);
              const hex = mColor.hex;

              return `  --color-${camelCase(mColor.name)}: ${hex};`;
            })
            .join('\n')}\n}`
        );
      })
      .join('\n')}`;

  return ':root{\n' + `${colors}${types}\n` + '}\n' + `${accents}`;
};
