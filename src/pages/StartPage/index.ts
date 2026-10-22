import chroma from 'chroma-js';

import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnAfterAppRender, addOnInput } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { updateCSSVars } from 'pages/StartPage/components/PickColor/utils/update-css-vars';
import { getOptions } from 'utils/get-options';
import { initMoebius } from 'utils/init-moebius';
import { onColorClick, onColorKeydown } from 'utils/on-color-click';

import './styles/start-page.css';

import { Band } from './components/Band';
import { Palettes, createPalettes } from './components/Palettes';
import { Settings } from './components/Settings';

const html = String.raw;

export const StartPage = async ({
  params
}: {
  params: MoebiusSiteDefaultOptionsType;
}) => {
  await initMoebius();

  const options = {
    ...(getOptions() as MoebiusSiteDefaultOptionsType),
    ...params
  };

  updateCSSVars(options);

  addOnAfterAppRender(() => {
    const colorElements = document.querySelectorAll(
      '[data-color-hex].ph.color, rect[data-color-hex]'
    );

    if (colorElements && colorElements.length !== 0) {
      colorElements.forEach((element) => {
        element.removeEventListener('click', onColorClick);
        element.addEventListener('click', onColorClick);
        element.removeEventListener('keydown', onColorKeydown);
        element.addEventListener('keydown', onColorKeydown);
      });
    }
  });

  addOnInput('color-picker-range-primary-hue', (e: EventType<HTMLElement>) => {
    document.documentElement.style.setProperty(
      '--moebius-primary-hue',
      e.target.value as string
    );
  });

  addOnInput(
    'color-picker-range-secondary-hue',
    (e: EventType<HTMLElement>) => {
      document.documentElement.style.setProperty(
        '--moebius-secondary-hue',
        e.target.value as string
      );
    }
  );

  addOnInput(
    'color-picker-range-divergent-hue',
    (e: EventType<HTMLElement>) => {
      document.documentElement.style.setProperty(
        '--moebius-divergent-hue',
        e.target.value as string
      );
    }
  );

  addOnInput('divergent-lightness', (e: EventType<HTMLElement>) => {
    const divergentColorRangeChromaInputElement =
      document.querySelector('#divergent-chroma');
    const divergentColorRangeHueInputElement = document.querySelector(
      '#color-picker-range-divergent-hue'
    );

    if (
      !divergentColorRangeChromaInputElement ||
      !divergentColorRangeHueInputElement
    )
      return;

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
    let [h, s, l] = chroma
      .lch(
        Number(e.target.value),
        Number(
          (divergentColorRangeChromaInputElement as HTMLInputElement).value
        ),
        Number((divergentColorRangeHueInputElement as HTMLInputElement).value)
      )
      .hsl();

    l = Number((l * 100).toFixed());
    document.documentElement.style.setProperty(
      '--moebius-divergent-lightness',
      `${l}%`
    );
  });

  addOnInput('divergent-chroma', (e: EventType<HTMLElement>) => {
    const divergentColorRangeLightnessInputElement = document.querySelector(
      '#divergent-lightness'
    );
    const divergentColorRangeHueInputElement = document.querySelector(
      '#color-picker-range-divergent-hue'
    );

    if (
      !divergentColorRangeLightnessInputElement ||
      !divergentColorRangeHueInputElement
    )
      return;

    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
    let [h, s, l] = chroma
      .lch(
        Number(
          (divergentColorRangeLightnessInputElement as HTMLInputElement).value
        ),
        Number(e.target.value),
        Number((divergentColorRangeHueInputElement as HTMLInputElement).value)
      )
      .hsl();

    s = Number((s * 100).toFixed());
    document.documentElement.style.setProperty(
      '--moebius-divergent-saturation',
      `${s}%`
    );
  });

  const moebius = createPalettes(options);
  const palette = options.palette ?? 'interpolate';

  // The palette in a band across the top, then the settings beside the
  // results (#48)
  return html`<h1 class="ph visually-hidden">
      moebius, a color palette generator
    </h1>
    ${Band({ colors: moebius.colors[palette], palette, options })}
    <div class="ph workspace">
      ${Settings({ options })}
      <div class="ph results">${await Palettes({ options, moebius })}</div>
    </div>`;
};
