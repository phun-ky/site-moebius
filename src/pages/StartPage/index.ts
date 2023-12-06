import chroma from 'chroma-js';
import { Palettes } from 'components/Palettes';
import { MoebiusSitePickColorItemType, PickColor } from 'components/PickColor';
import { getOptions } from 'utils/get-options';
import { addOnInput } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { initMoebius } from 'utils/init-moebius';
import { updateCSSVars } from 'components/PickColor/utils/update-css-vars';
import { Settings } from 'components/Settings';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';

const html = String.raw;

export const StartPage = async ({ params }) => {
  await initMoebius();

  const options = {
    ...(getOptions() as MoebiusSiteDefaultOptionsType),
    ...params
  };

  updateCSSVars(options);

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

    // eslint-disable-next-line no-unused-vars, prefer-const, @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line no-unused-vars, prefer-const, @typescript-eslint/no-unused-vars
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

  return html`<section class="ph section workspace">
      <div class="ph container workspace">
        <div class="ph color-picker">
          <h2 class="ph">Choose colors</h2>
          <div class="ph color-picker-inner">
            ${(
              [
                {
                  type: 'primary',
                  title: 'Primary',
                  color: options.baseColor
                },
                {
                  type: 'secondary',
                  title: 'Secondary',
                  color: options.secondaryColor
                },
                {
                  type: 'divergent',
                  title: 'Divergent',
                  color: options.divergentColor
                }
              ] as MoebiusSitePickColorItemType[]
  )
    .map((item: MoebiusSitePickColorItemType) =>
      PickColor({ item, options })
    )
    .join('\n')}
          </div>
        </div>
        ${await Palettes({ options })} ${Settings({ options })}
      </div>
    </section>
    <section class="ph section workspace">
      <div class="ph container">
        <div class="ph color-picker-help message note">
          <strong class="ph title">
            <svg
              class="ph icon"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
              ></path>
            </svg>
            How to pick colors
            <!-- display: block -->
          </strong>
          <p class="ph">
            Click on the color square to change colors, or input a hex code in
            the input fields. You can also refresh to get a random color.
          </p>
          <p class="ph">
            Click on any color displayed (except for the horizontal gradient) to
            choose that color. When you click on a color, the color is chosen,
            and it is also copied to your clipboard.
          </p>
        </div>
      </div>
    </section>`;

  // const obj = {
  //   baseColor: primaryColor,
  //   secondaryColor,
  //   divergentColor,
  //   diverging,
  //   bezier,
  //   reverseDirection,
  //   randomOffset,
  //   correctLightness,
  //   noDuplicates,
  //   colorScaleMode,
  //   numberOfColors: 7
  // };

  // window.location.hash = btoa(JSON.stringify(obj));

  // setColor(moebius);

  /*
  addOnAfterAppRender(() => {
    const colorElements = document.querySelectorAll(
      '[data-color-hex].ph.color, path[data-color-hex], rect[data-color-hex]'
    );

    if (colorElements && colorElements.length !== 0) {
      colorElements.forEach((element) => {
        element.addEventListener('click', async (e) => {
          const hex = element.getAttribute('data-color-hex');

          if (hex) {
            await copy(hex);

            const moebius = new MoebiusPalettes({
              baseColor: new MoebiusColor(hex, ''),
              secondaryColor: new MoebiusColor(secondaryColor, ''),
              divergentColor: new MoebiusColor(divergentColor, '').hex,
              diverging,
              bezier,
              reverseDirection,
              randomOffset,
              correctLightness,
              noDuplicates,
              colorScaleMode,
              numberOfColors: 7
            });

            setColor(moebius);
          }
        });
      });
    }
  });

  */

  //   return `<div class="ph hero">
  //   <div class="ph logo">
  //   <svg id="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 67.263">
  //       <path d="M57.682 1.369h-9.386c-3.226 0-3.715 2.15-4.4 3.324l-13.491 24.05-13.394-24.05c-.782-1.173-1.173-3.324-4.497-3.324H2.835C.587 1.369 0 2.444 0 4.204V62.96c0 2.248 1.075 2.835 2.835 2.835h9.679c1.76 0 2.835-.586 2.835-2.835V29.818l9.874 17.11c.49.782 1.271 2.052 2.738 2.052h4.888c1.467 0 2.347-1.27 2.835-2.053l9.777-17.109v33.143c0 2.248 1.075 2.835 2.835 2.835h9.386c1.76 0 2.835-.586 2.835-2.835V4.204c0-1.76-.587-2.835-2.835-2.835zM125.53 22.095C125.53 6.648 110.867 0 99.233 0 87.598 0 73.129 6.648 73.129 22.095v23.073c0 15.447 14.469 22.095 26.103 22.095 11.634 0 26.299-6.648 26.299-22.095zm-15.348 21.704c0 6.257-4.498 9.874-10.95 9.874-6.355 0-10.852-3.617-10.852-9.874V23.464c0-6.257 4.497-9.875 10.852-9.875 6.452 0 10.95 3.618 10.95 9.875zM181.941 52.207H138.73c-1.76 0-2.835.586-2.835 2.835v8.017c0 2.248 1.075 2.835 2.835 2.835h43.212c1.76 0 2.836-.587 2.836-2.835v-8.017c0-2.249-1.076-2.835-2.836-2.835zm-4.888-25.42h-33.436c-1.76 0-2.835.587-2.835 2.836v8.017c0 2.248 1.076 2.835 2.835 2.835h33.436c1.76 0 2.835-.587 2.835-2.835v-8.017c0-2.249-1.075-2.835-2.835-2.835zm4.888-25.223H138.73c-1.76 0-2.835.587-2.835 2.835v8.017c0 2.249 1.075 2.835 2.835 2.835h43.212c1.76 0 2.836-.586 2.836-2.835V4.4c0-2.248-1.076-2.835-2.836-2.835zM242.947 32.458c.88-.391 7.137-3.52 7.137-13.394 0-9.19-6.844-17.695-22.78-17.695H199.93c-2.248 0-2.835 1.075-2.835 2.835V62.96c0 1.76.587 2.835 2.835 2.835h28.743c13.59 0 23.268-6.355 23.268-18.77 0-10.56-8.212-14.275-8.994-14.568zm-14.078 19.455h-16.425v-36.76h14.86c5.084 0 8.115 1.076 8.115 5.475 0 3.813-2.444 5.866-8.115 5.866h-1.27c-2.25 0-2.836 1.076-2.836 2.836v7.43c0 1.76.587 2.835 2.836 2.835h2.248c4.693 0 8.115 1.369 8.115 5.964 0 4.4-2.738 6.354-7.528 6.354zM292.22 52.402h-6.159V15.056h5.866c2.249 0 2.836-1.076 2.836-2.835V4.3c0-1.76-.587-2.835-2.836-2.835H264.75c-2.249 0-2.836 1.076-2.836 2.836v7.919c0 1.76.587 2.835 2.836 2.835h5.963v37.346h-6.159c-2.249 0-2.835 1.076-2.835 2.835v7.724c0 1.76.586 2.835 2.835 2.835h27.668c2.248 0 2.835-1.075 2.835-2.835v-7.724c0-1.76-.587-2.835-2.835-2.835zM355.768 1.466h-9.679c-1.76 0-2.835.587-2.835 2.836v39.692c0 6.16-4.106 9.68-10.558 9.68-6.453 0-10.461-3.52-10.461-9.68V4.302c0-2.249-1.076-2.836-2.836-2.836h-9.678c-1.76 0-2.836.587-2.836 2.836v41.843c0 15.35 14.176 21.118 25.81 21.118 11.635 0 25.908-5.769 25.908-21.118V4.302c0-2.249-1.075-2.836-2.835-2.836zM402.598 28.45c-3.91-1.565-18.282-3.715-18.282-9.679 0-4.4 5.377-5.67 8.603-5.67 2.933 0 6.453.88 8.31 2.64 1.173 1.172 1.662 1.955 2.053 2.932.489 1.271.782 2.64 2.64 2.64h9.58c2.25 0 2.836-.391 2.836-2.738C418.338 5.67 404.748 0 392.332 0c-12.22.489-23.757 6.746-23.757 19.455 0 12.417 9.093 16.327 18.967 19.456 8.31 2.64 17.011 2.737 17.011 8.212s-4.302 6.648-9.58 6.648c-3.618 0-7.627-.88-9.582-3.226-1.27-1.467-1.76-2.738-1.857-4.009-.196-2.444-1.271-2.737-3.52-2.737h-9.483c-2.249 0-2.835.489-2.835 2.737 0 13.687 14.078 20.727 26.298 20.727 15.056 0 26.006-6.648 26.006-20.531 0-13.296-10.363-16.131-17.402-18.282Z" />
  //       </svg>
  //   </div>
  //   <div class="ph content">
  //     <div id="moebius" class="ph"></div>

  //     </svg>
  //   </div>
  // </div>

  //         </div>
  //         <aside class="ph  settings">
  //           <h2 class="ph">Color blind simulator</h2>
  //           <form class="ph color-settings color-blind-simulator" onsubmit="javascript:return false;">
  //             <fieldset class="ph color-blind">
  //               <legend class="ph">Type</legend>
  //               <div class="ph color-blind-inner">
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" checked value="normal" id="color-blind-sim-normal" class="ph" />
  //                   <label for="color-blind-sim-normal" class="ph">normal</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="protanomaly" id="color-blind-sim-protanomaly" class="ph" />
  //                   <label for="color-blind-sim-protanomaly" class="ph">protanomaly</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="protanopia" id="color-blind-sim-protanopia" class="ph" />
  //                   <label for="color-blind-sim-protanopia" class="ph">protanopia</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="deuteranomaly" id="color-blind-sim-deuteranomaly" class="ph" />
  //                   <label for="color-blind-sim-deuteranomaly" class="ph">deuteranomaly</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="deuteranopia" id="color-blind-sim-deuteranopia" class="ph" />
  //                   <label for="color-blind-sim-deuteranopia" class="ph">deuteranopia</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="tritanomaly" id="color-blind-sim-tritanomaly" class="ph" />
  //                   <label for="color-blind-sim-tritanomaly" class="ph">tritanomaly</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="tritanopia" id="color-blind-sim-tritanopia" class="ph" />
  //                   <label for="color-blind-sim-tritanopia" class="ph">tritanopia</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="achromatomaly" id="color-blind-sim-achromatomaly" class="ph" />
  //                   <label for="color-blind-sim-achromatomaly" class="ph">achromatomaly</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-blind-sim" value="achromatopsia" id="color-blind-sim-achromatopsia" class="ph" />
  //                   <label for="color-blind-sim-achromatopsia" class="ph">achromatopsia</label>
  //                 </div>
  //               </div>
  //             </fieldset>
  //           </form>
  //           <h2 class="ph">Settings</h2>
  //           <form class="ph color-settings" onsubmit="javascript:return false;">
  //             <fieldset class="ph color-scale">
  //               <legend class="ph">Color scale method</legend>
  //               <div class="ph color-scale-inner">
  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-scale" value="rgb" id="color-scale-rgb" class="ph" />
  //                   <label for="color-scale-rgb" class="ph">rgb</label>
  //                 </div>

  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-scale" value="lab" id="color-scale-lab" class="ph" />
  //                   <label for="color-scale-lab" class="ph">lab</label>
  //                 </div>

  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-scale" value="lrgb" id="color-scale-lrgb" class="ph" />
  //                   <label for="color-scale-lrgb" class="ph">lrgb</label>
  //                 </div>

  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-scale" value="hsl" id="color-scale-hsl" class="ph" />
  //                   <label for="color-scale-hsl" class="ph">hsl</label>
  //                 </div>

  //                 <div class="ph input-group">
  //                   <input type="radio" name="color-scale" checked value="lch" id="color-scale-lch" class="ph" />
  //                   <label for="color-scale-lch" class="ph">lch</label>
  //                 </div>
  //               </div>
  //             </fieldset>

  //             <fieldset class="ph color-extras">
  //               <legend class="ph">Corrections</legend>
  //               <div class="ph color-extras-inner">
  //                 <div class="ph input-group">
  //                   <input type="checkbox" name="bezier" id="bezier" class="ph" />
  //                   <label for="bezier" class="ph">bezier</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="checkbox" name="correct-lightness" id="correct-lightness" class="ph" />
  //                   <label for="correct-lightness" class="ph">correct lightness</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="checkbox" name="no-duplicates" checked id="no-duplicates" class="ph" />
  //                   <label for="no-duplicates" class="ph">no duplicates</label>
  //                 </div>
  //                 <div class="ph input-group">
  //                   <input type="checkbox" name="reverse-direction" id="reverse-direction" class="ph" />
  //                   <label for="reverse-direction" class="ph">reverse direction</label>
  //                 </div>
  //               </div>
  //             </fieldset>
  //           </form>
  //         </aside>
};
