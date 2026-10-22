import { CodeBlock } from 'components/page-section/CodeBlock';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { colorBlindCheck } from 'features/color-blind/color-blind-check';
import { Accents } from 'pages/StartPage/components/Accents';
import { getGradientStyle } from 'utils/get-gradient-style';

import { SettingsColorBlind } from '../../Settings/SettingsColorBlind';
import { Swatch } from '../../Swatch';

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

  return html`<div class="ph palette ${id}">
      ${SettingsColorBlind({ options })}
      ${!isColorBlindSafe ? ColorBlindWarning(colorBlindCheckResult) : ''}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        class="ph svg"
        id="${id}-svg"
        viewBox="0 0 256 256"
      ></svg>
      ${SVGPixels({ id, colors: moebius.colors[id] })}
      <output
        class="ph gradient"
        id="${id}-gradient"
        style="${gradientStyle}"
      ></output>
      <output class="ph swatch" id="${id}">
        ${Swatch(moebius.colors[id], id, options)}
      </output>
    </div>
    ${SettingsLuminanceShift({ id, options })}
    ${SettingsMonochromatic({ id, options })}
    <output class="ph accents" id="${id}-accents">
      ${Accents({ colors: moebius.accents[id] })}
    </output>

    <details class="ph export-code" data-palette="${id}">
      <summary class="ph">
        <h3 class="ph">CSS and JavaScript code</h3>
      </summary>
      <h4 class="ph">CSS Variables</h4>
      ${CodeBlock({ id, language: 'css', content: '' })}
      <h4 class="ph">JavaScript</h4>
      ${CodeBlock({ id, language: 'js', content: '' })}
    </details>`;
};
