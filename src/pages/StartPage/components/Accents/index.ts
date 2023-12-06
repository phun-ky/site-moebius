import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { Color } from 'pages/StartPage/components/Swatch/components/Color';
import { getA11yTextColor } from 'utils/get-a11y-text-color';

const html = String.raw;

export type MoebiusSiteAccentsPropsType = {
  colors: MoebiusColorValueHexType[][];
};

export type MoebiusSiteAccentGroupPropsType = {
  content: string;
};

export const AccentGroup = (props: MoebiusSiteAccentGroupPropsType) => {
  const { content } = props;

  return html`<div class="ph group">${content}</div>`;
};

export type MoebiusSiteAccentColorsPropsType = {
  content: string;
};

export const AccentColors = (props: MoebiusSiteAccentColorsPropsType) => {
  const { content } = props;

  return html`<div class="ph colors">${content}</div>`;
};

export const Accents = (props: MoebiusSiteAccentsPropsType) => {
  const { colors } = props;
  const { MoebiusColor } = window;

  return colors
    .map((accentGroup) =>
      AccentGroup({
        content: AccentColors({
          content: accentGroup
            .map((color) => {
              const mColor = new MoebiusColor(color);
              const backgroundColor = mColor.hex;
              const foregroundColor = getA11yTextColor(mColor.hex);

              return Color({
                color: mColor,
                text: mColor.hex,
                backgroundColor,
                foregroundColor
              });
            })
            .join('\n')
        })
      })
    )
    .join('\n');
};
