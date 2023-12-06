import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { shuffleArray } from 'utils/shuffle-array';

const html = String.raw;

export type MoebiusSiteSVGPixelsPropsType = {
  id: string;
  colors: MoebiusColorValueHexType[];
};

export const SVGPixels = (props: MoebiusSiteSVGPixelsPropsType) => {
  const { id, colors } = props;
  const { MoebiusColor } = window;
  const width = 256;
  const newArray = shuffleArray(colors.flat());

  let x = 0;
  let y = 0;
  // let yInterval = 1;

  const squareItems = Math.ceil(Math.sqrt(newArray.length));
  //const square = 256 / squareItems;
  const square = width / squareItems;

  return html`<svg
    xlmns="http://www.w3.org/2000/svg"
    class="ph mix"
    id="${id}-mix"
  >
    ${newArray.map((color, index) => {
    const mColor = new MoebiusColor(color);

    if (index !== 0) {
      x += square;
    }

    if (x >= squareItems * square - square / 2) {
      x = 0;
      y += square;
      // yInterval++;
    }

    return `<rect height="${square}" width="${square}" fill="${mColor.hex}" data-color-hex="${mColor.hex}" x="${x}" y="${y}"/>`;
  })}
  </svg>`;
};
