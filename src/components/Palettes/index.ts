import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { Accents } from 'components/Accents';
import { Swatch } from 'components/Swatch';
import { Tabs } from 'components/Tabs';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnAfterAppRender, addOnChange } from 'lib/spa';
import { MoebiusSiteEventType } from 'types';
import { generateAccentGradientCssVariables } from 'utils/generate-accent-gradients-css-variables';
import { generatePixels } from 'utils/generate-pixels';
import { getGradientStyle } from 'utils/get-gradient-style';
import { setOptions } from 'utils/set-options';

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
  const { MoebiusColor, MoebiusPalettes, MoebiusSVGHelper } = window;
  // const mainElement = document.querySelector('#app');
  // console.log('mainElement', mainElement);
  // if (mainElement) {
  //   mainElement.classList.remove('moebius-loading');
  // }
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

  addOnAfterAppRender(() => {
    generateAccentGradientCssVariables(moebius.accents);
  });

  addOnChange(
    '#luminanceShift-diverging',
    (e: MoebiusSiteEventType<HTMLInputElement>) => {
      setOptions({ diverging: e.target.checked });
    }
  );

  const outputIdArray = [
    'interpolate',
    'luminanceShift',
    'monochromatic',
    'complement',
    'split',
    'triadic',
    'tetradic',
    'pentadic',
    'hexadic',
    'analogous'
  ];
  const tabItems = outputIdArray.map((id) => {
    const gradientStyle = getGradientStyle(moebius.colors[id]);

    addOnAfterAppRender(() => {
      const svgHelper = new MoebiusSVGHelper();
      const element = document.querySelector(`#${id}-svg`);

      if (element) {
        element.innerHTML = '';

        const colors = moebius.colors[id].map(
          (color: MoebiusColorValueHexType) =>
            moebius.monochromatic(color, { numberOfColors: 3 })
        );

        element.appendChild(svgHelper.getColorPiePaths(colors));
      }

      generatePixels(moebius.colors[id], id);
    });

    return {
      id,
      name: id,
      content: html`<section class="ph" id="section-${id}">
        <div class="ph palette">
          <svg
            xlmns="http://www.w3.org/2000/svg"
            class="ph svg"
            id="${id}-svg"
            viewBox="0 0 256 256"
          ></svg>
          <svg
            xlmns="http://www.w3.org/2000/svg"
            class="ph mix"
            id="${id}-mix"
          ></svg>
          <output
            class="ph gradient"
            id="${id}-gradient"
            style="${gradientStyle}"
          ></output>
          <output class="ph swatch" id="${id}">
            ${Swatch(moebius.colors[id], id, options)}
          </output>
        </div>
        ${id === 'luminanceShift'
    ? html`<form
              class="ph color-settings"
              onsubmit="javascript:return false;"
            >
              <fieldset class="ph color-extras">
                <legend class="ph">Settings</legend>
                <div class="ph color-extras-inner">
                  <div class="ph input-group">
                    <input
                      type="checkbox"
                      name="diverging"
                      id="luminanceShift-diverging"
                      ${options.diverging ? 'checked="checked"' : ''}
                      class="ph"
                    />
                    <label for="diverging" class="ph">diverging</label>
                  </div>
                </div>
              </fieldset>
            </form>`
    : ''}
        <output class="ph accents" id="${id}-accents">
          ${Accents({ colors: moebius.accents[id] })}
        </output>

        <details class="ph">
          <summary class="ph">
            <h3 class="ph">CSS and JavaScript code</h3>
          </summary>
          <h4 class="ph">CSS Variables</h4>

          <div class="ph code-toolbar">
            <div class="ph tools">
              <span class="ph language">css</span>
              <button class="ph copy">copy</button>
            </div>
            <pre
              class="ph language-css"
              language="css"
            ><code class="ph language-css css" id="${id}-code-css"></code></pre>
          </div>
          <h4 class="ph">JavaScript</h4>

          <div class="ph code-toolbar">
            <div class="ph tools">
              <span class="ph language">javascript</span>
              <button class="ph copy">copy</button>
            </div>
            <pre
              class="ph language-js"
              language="js"
            ><code class="ph language-js js" id="${id}-code-js"></code></pre>
          </div>
        </details>
      </section>`
    };
  });

  return html`<div class="ph palettes">
    <h2 class="ph">Palettes</h2>
    ${Tabs({ id: 'palettes', items: tabItems })}
  </div>`;
};
