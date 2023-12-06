import { getA11yTextColor } from 'utils/get-a11y-text-color';
import { colorBlindCheck } from './color-blind/color-blind-check';
import { colorBlindSim } from './color-blind/color-blind-sim';

export const generateSwatch = (colors, id: string, moebius) => {
  const element = document.querySelector(`#${id}`);

  console.log(element, id, colors, moebius);

  if (!element) return;

  const { MoebiusColor } = window;

  element.innerHTML = '';

  //element.appendChild();
  const swatchFR = document.createDocumentFragment();
  const colorBlindSimType = 'normal';

  let diff = 0;

  const colorBlindCheckResult = colorBlindCheck(colors);
  const isColorBlindSafe = colorBlindCheckResult.length === 0;
  const parentElement = element.parentElement;

  if (parentElement) {
    const els = parentElement.querySelectorAll('.ph.color-blind-warning');

    if (els) {
      els.forEach((el) => el.remove());
    }

    if (!isColorBlindSafe) {
      const colorBlindWarningElement = document.createElement('div');

      colorBlindWarningElement.classList.add('ph');
      colorBlindWarningElement.classList.add('message');
      colorBlindWarningElement.classList.add('color-blind-warning');
      colorBlindWarningElement.classList.add('warning');

      const colorBlindTitleElement = document.createElement('span');

      colorBlindTitleElement.classList.add('ph');
      colorBlindTitleElement.classList.add('title');
      colorBlindTitleElement.textContent = 'Colors not safe';

      const colorBlindParagraphElement = document.createElement('p');

      colorBlindParagraphElement.classList.add('ph');
      colorBlindParagraphElement.classList.add('description');
      colorBlindParagraphElement.textContent = `These colors are not color blind safe! Affected color blindness types are: ${colorBlindCheckResult.join(
        ', '
      )}`;

      colorBlindWarningElement.appendChild(colorBlindTitleElement);
      colorBlindWarningElement.appendChild(colorBlindParagraphElement);

      parentElement.insertBefore(colorBlindWarningElement, element);
    }
  }

  colors.forEach((color) => {
    color = new MoebiusColor(color);

    const swatchColorElement = document.createElement('div');

    swatchColorElement.classList.add('ph');
    swatchColorElement.classList.add('color');
    swatchColorElement.setAttribute('data-rel', color.hex);
    swatchColorElement.innerText = color.hex;
    swatchColorElement.setAttribute('data-color-hex', color.hex);
    swatchColorElement.setAttribute('data-color-name', color.name);
    swatchColorElement.setAttribute('data-color-rgb', color.rgb);
    swatchColorElement.setAttribute('data-color-hsl', color.hsl);

    if (colorBlindSimType !== 'normal') {
      const blindSimColor = colorBlindSim(color.hex, colorBlindSimType);

      swatchColorElement.style.backgroundColor = blindSimColor;
      swatchColorElement.style.color = getA11yTextColor(blindSimColor);
    } else {
      swatchColorElement.style.backgroundColor = color.hex;
      swatchColorElement.style.color = getA11yTextColor(color.hex);
    }

    swatchFR.appendChild(swatchColorElement);
  });

  if (colors.length < moebius.options.numberOfColors) {
    diff = moebius.options.numberOfColors - colors.length;

    const lastColor = colors[colors.length - 1];

    [...new Array(diff)].forEach(() => {
      const swatchColorElement = document.createElement('div');

      swatchColorElement.classList.add('ph');
      swatchColorElement.classList.add('color');
      swatchColorElement.classList.add('no-color');
      swatchColorElement.innerText = 'No color';

      swatchColorElement.style.backgroundColor = lastColor;
      swatchColorElement.style.color = getA11yTextColor(lastColor);

      swatchFR.appendChild(swatchColorElement);
    });
  }

  element.appendChild(swatchFR);
};
