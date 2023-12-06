import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { UnitItem } from './UnitItem';

const html = String.raw;

export type MoebiusSiteColorUnitsFormPropsType = {
  color: MoebiusColorValueHexType;
};

export const ColorUnitsForm = (props: MoebiusSiteColorUnitsFormPropsType) => {
  const { color } = props;
  const { MoebiusColor } = window;
  const mColor = new MoebiusColor(color);
  const items = [
    { unit: 'color-name', title: 'name', value: mColor['name'] },
    { unit: 'lch', title: 'lch', value: mColor['lch'] },
    { unit: 'oklch', title: 'oklch', value: mColor['oklch'] },
    { unit: 'hex', title: 'hex', value: mColor['hex'] },
    { unit: 'rgb', title: 'rgb', value: mColor['rgb'] },
    { unit: 'rgbFloat', title: 'rgbFloat', value: mColor['rgbFloat'] },
    { unit: 'hsl', title: 'hsl', value: mColor['hsl'] },
    { unit: 'hslFloat', title: 'hslFloat', value: mColor['hslFloat'] },
    { unit: 'hwb', title: 'hwb', value: mColor['hwb'] },
    { unit: 'hsv', title: 'hsv', value: mColor['hsv'] },
    { unit: 'hsi', title: 'hsi', value: mColor['hsi'] },
    { unit: 'lab', title: 'lab', value: mColor['lab'] },
    { unit: 'oklab', title: 'oklab', value: mColor['oklab'] },
    { unit: 'cmyk', title: 'cmyk', value: mColor['cmyk'] },
    { unit: 'xyz', title: 'xyz', value: mColor['xyz'] }
  ];

  return html`<form class="ph color-units" onsubmit="javascript: return false;">
    ${items.map((item) => UnitItem({ item })).join('\n')}
  </form>`;
};
