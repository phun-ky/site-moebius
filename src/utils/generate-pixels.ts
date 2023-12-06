import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { shuffleArray } from './shuffle-array';

export const generatePixels = (
  colors: MoebiusColorValueHexType[],
  id: string
) => {
  const element = document.querySelector(`#${id}-mix`);

  if (!element) return;

  const { MoebiusColor } = window;
  const width = 256;

  element.innerHTML = '';

  const newArray = shuffleArray(colors.flat());

  let x = 0;
  let y = 0;
  let yInterval = 1;

  const squareItems = Math.ceil(Math.sqrt(newArray.length));
  //const square = 256 / squareItems;
  const square = width / squareItems;

  newArray.forEach((color, index) => {
    const mColor = new MoebiusColor(color);
    const rectElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );

    if (index !== 0) {
      x += square;
    }

    if (x >= squareItems * square - square / 2) {
      x = 0;
      y += square;
      yInterval++;
    }

    rectElement.setAttributeNS(null, 'height', `${square}`);
    rectElement.setAttributeNS(null, 'width', `${square}`);
    rectElement.setAttributeNS(null, 'fill', mColor.hex);
    rectElement.setAttributeNS(null, 'data-color-hex', mColor.hex);
    rectElement.setAttributeNS(null, 'x', `${x}`);
    rectElement.setAttributeNS(null, 'y', `${y}`);

    element.appendChild(rectElement);
  });

  //element.style.height = `${square * yInterval}px`;
};
