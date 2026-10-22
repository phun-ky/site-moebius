import { Tabs } from 'components/navigation/Tabs';
import { CodeBlock } from 'components/page-section/CodeBlock';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { colorBlindCheck } from 'features/color-blind/color-blind-check';
import { CODE_FORMATS, exportCode, highlightCode } from 'features/export-code';
import { addOnAfterAppRender } from 'lib/spa';
import { Accents } from 'pages/StartPage/components/Accents';
import { getGradientStyle } from 'utils/get-gradient-style';

import { ColorBlindWarning } from './ColorBlindWarning';
import { SettingsLuminanceShift } from './SettingsLuminanceShift';
import { SettingsMonochromatic } from './SettingsMonochromatic';
import { SVGPixels } from './SVGPixels';

const html = String.raw;

export type MoebiusSitePaletteItemPropsType = {
  id: string;
  moebius: typeof window.MoebiusPalettes;
  options: MoebiusSiteDefaultOptionsType;
};

export const PaletteItem = (props: MoebiusSitePaletteItemPropsType) => {
  const { id, moebius, options } = props;
  const gradientStyle = getGradientStyle(moebius.colors[id]);
  const colorBlindCheckResult = colorBlindCheck(moebius.colors[id]);
  const isColorBlindSafe = colorBlindCheckResult.length === 0;

  addOnAfterAppRender(highlightCode);

  return html`${!isColorBlindSafe ? ColorBlindWarning(colorBlindCheckResult) : ''}
    ${SettingsLuminanceShift({ id, options })}
    ${SettingsMonochromatic({ id, options })}
    <div class="ph palette ${id}">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        class="ph svg"
        id="${id}-svg"
        viewBox="0 0 256 256"
      ></svg>
      ${SVGPixels({ id, colors: moebius.colors[id] })}
      <div
        class="ph gradient"
        id="${id}-gradient"
        style="${gradientStyle}"
      ></div>
    </div>
    <section class="ph shades" aria-labelledby="shades-heading">
      <h3 class="ph" id="shades-heading">Shades</h3>
      <p class="ph hint">
        Each color, darkening in nine steps. Click one to copy it and make it
        the primary color.
      </p>
      <div class="ph accents" id="${id}-accents">
        ${Accents({ colors: moebius.accents[id] })}
      </div>
    </section>
    <section class="ph code-box" aria-labelledby="code-heading">
      <h3 class="ph" id="code-heading">Code</h3>
      <p class="ph hint">
        CSS custom properties, a JavaScript array, or design tokens in the
        Design Tokens Community Group format.
      </p>
      ${Tabs({
        id: 'code',
        items: CODE_FORMATS.map((format) => ({
          id: `code-${format.id}`,
          name: format.name,
          content: () =>
            CodeBlock({
              id: `${id}-${format.id}`,
              language: format.language,
              content: exportCode(
                format.id,
                moebius.colors[id],
                moebius.accents[id],
                id
              )
            })
        }))
      })}
    </section>`;
};
