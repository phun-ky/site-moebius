import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { setCurrentPalettes } from 'features/export-code';
import { addOnAfterAppRender, addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { MoebiusSiteEventType } from 'types';
import { generateAccentGradientCssVariables } from 'utils/generate-accent-gradients-css-variables';
import { setOptions } from 'utils/set-options';

import { PaletteItems } from './components/PaletteItems';

import './styles/palettes.css';

const html = String.raw;

export type PalettesPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const Palettes = async (props: PalettesPropsType) => {
  const { options } = props;
  const {
    baseColor,
    secondaryColor,
    divergentColor,
    diverging,
    bezier,
    reverseDirection,
    randomOffset,
    correctLightness,
    noDuplicates,
    colorScaleMode,
    numberOfColors
  } = options;
  const { MoebiusColor, MoebiusPalettes } = window;
  const moebius = new MoebiusPalettes({
    baseColor: new MoebiusColor(baseColor, ''),
    secondaryColor: new MoebiusColor(secondaryColor, ''),
    divergentColor: new MoebiusColor(divergentColor, '').hex,
    diverging,
    bezier,
    reverseDirection,
    randomOffset,
    correctLightness,
    noDuplicates,
    colorScaleMode,
    numberOfColors
  });

  setCurrentPalettes(moebius);

  addOnAfterAppRender(() => {
    generateAccentGradientCssVariables(moebius.accents);
  });

  addOnChange(
    '#luminanceShift-diverging',
    (e: MoebiusSiteEventType<HTMLInputElement>) => {
      setOptions({ diverging: e.target.checked });
    }
  );

  addOnChange(
    '#monochromatic-random-offset',
    (e: MoebiusSiteEventType<HTMLInputElement>) => {
      setOptions({ randomOffset: e.target.checked });
    }
  );

  addOnChange(
    '.ph.color-blind-simulator input[type="radio"]',
    (e: EventType<HTMLInputElement>) => {
      setOptions({ colorBlindSim: e.target.value });
    }
  );

  return html`<div class="ph palettes">
    <h2 class="ph">Palettes</h2>
    ${PaletteItems({ moebius, options })}
  </div>`;
};
