import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { setCurrentPalettes } from 'features/export-code';
import { addOnAfterAppRender, addOnChange } from 'lib/spa';
import { MoebiusSiteEventType } from 'types';
import { generateAccentGradientCssVariables } from 'utils/generate-accent-gradients-css-variables';
import { setOptions } from 'utils/set-options';

import { PaletteItems } from './components/PaletteItems';

import './styles/palettes.css';

const html = String.raw;

export type PalettesPropsType = {
  options: MoebiusSiteDefaultOptionsType;
  moebius: typeof window.MoebiusPalettes;
};

/**
 * Make the palettes for the options, for the band and the results.
 * @param {MoebiusSiteDefaultOptionsType} options - The page's options.
 * @returns {typeof window.MoebiusPalettes} The palettes.
 */
export const createPalettes = (options: MoebiusSiteDefaultOptionsType) => {
  const { MoebiusColor, MoebiusPalettes } = window;

  return new MoebiusPalettes({
    baseColor: new MoebiusColor(options.baseColor, ''),
    secondaryColor: new MoebiusColor(options.secondaryColor, ''),
    divergentColor: new MoebiusColor(options.divergentColor, '').hex,
    diverging: options.diverging,
    bezier: options.bezier,
    reverseDirection: options.reverseDirection,
    randomOffset: options.randomOffset,
    correctLightness: options.correctLightness,
    noDuplicates: options.noDuplicates,
    colorScaleMode: options.colorScaleMode,
    numberOfColors: options.numberOfColors
  });
};

export const Palettes = async (props: PalettesPropsType) => {
  const { options, moebius } = props;

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

  return html`<div class="ph palettes">
    <h2 class="ph">Palette</h2>
    <p class="ph hint">
      Click any color to copy it and make it the primary color.
    </p>
    ${PaletteItems({ moebius, options })}
  </div>`;
};
