import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { Label } from 'components/input-fields/Label';
import { RangeInput } from 'components/input-fields/RangeInput';

const html = String.raw;

export type MoebiusSiteColorPickerHueMapPropsType = {
  type: string;
  color: MoebiusColorValueHexType;
};

export const ColorPickerHueMap = (
  props: MoebiusSiteColorPickerHueMapPropsType
) => {
  const { type, color } = props;
  const { MoebiusColor } = window;
  const currentColor = new MoebiusColor(color);

  let currentColorHue = currentColor.toObject('hsl').h;

  if (type === 'divergent') {
    currentColorHue = currentColor.lch.h;
  }

  const extraRangeElements =
    type === 'divergent'
      ? html`<div class="ph input-group">
            ${Label({ labelFor: 'divergent-lightness', label: 'lightness' })}
            <input
              class="ph color-range lightness"
              id="divergent-lightness"
              type="range"
              step="1"
              min="80"
              max="100"
              defaultValue="${currentColor.lch.l.toFixed()}"
              value="${currentColor.lch.l.toFixed()}"
            />
          </div>
          <div class="ph input-group">
            ${Label({ labelFor: 'divergent-chroma', label: 'chroma' })}
            <input
              class="ph color-range chroma"
              id="divergent-chroma"
              type="range"
              step="1"
              min="0"
              max="50"
              defaultValue="${currentColor.lch.c.toFixed()}"
              value="${currentColor.lch.c.toFixed()}"
            />
          </div>`
      : '';

  return html`<div
      id="color-picker-hue-map-${type}"
      class="ph hue-map ${type}"
    ></div>
    ${RangeInput({
    id: `color-picker-range-${type}-hue`,
    className: 'color-range',
    step: 1,
    value: currentColorHue.toFixed(),
    min: 0,
    max: 359
  })}
    ${extraRangeElements}`;
};
