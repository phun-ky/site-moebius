import chroma from 'chroma-js';
import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { setOptions } from 'utils/set-options';
import { getOptions } from 'utils/get-options';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { normalizeHSV } from './normalize-hsv';
import { MouseEventType } from 'lib/spa/types';

export const handleHueMapClick = (
  e: MouseEventType<HTMLElement>,
  type: string,
  opts: MoebiusSiteDefaultOptionsType & {
    baseColor?: MoebiusColorValueHexType;
    secondaryColor?: MoebiusColorValueHexType;
  }
) => {
  const options = {
    ...(getOptions() as MoebiusSiteDefaultOptionsType),
    ...opts
  };

  let { baseColor: primaryColor, secondaryColor, divergentColor } = options;

  const primaryColorRangeInputElement = document.querySelector(
    '#color-picker-range-primary-hue'
  );
  const secondaryColorRangeInputElement = document.querySelector(
    '#color-picker-range-secondary-hue'
  );
  const divergentColorRangeHueInputElement = document.querySelector(
    '#color-picker-range-divergent-hue'
  );
  const divergentColorRangeLightnessInputElement = document.querySelector(
    '#divergent-lightness'
  );
  const divergentColorRangeChromaInputElement =
    document.querySelector('#divergent-chroma');

  if (
    !primaryColorRangeInputElement ||
    !secondaryColorRangeInputElement ||
    !divergentColorRangeHueInputElement ||
    !divergentColorRangeLightnessInputElement ||
    !divergentColorRangeChromaInputElement
  )
    return;

  const primaryHue = Number(
    (primaryColorRangeInputElement as HTMLInputElement).value
  );
  const secondaryHue = Number(
    (secondaryColorRangeInputElement as HTMLInputElement).value
  );
  const divergentLightness = Number(
    (divergentColorRangeLightnessInputElement as HTMLInputElement).value
  );
  const divergentChroma = Number(
    (divergentColorRangeChromaInputElement as HTMLInputElement).value
  );
  const divergentHue = Number(
    (divergentColorRangeHueInputElement as HTMLInputElement).value
  );
  const isPrimary = type === 'primary';
  const isSecondary = type === 'secondary';
  const isDivergent = type === 'divergent';
  const el = e.target;
  const { height, width } = el.getBoundingClientRect();
  const value = e.offsetY / height;
  const saturation = e.offsetX / width;

  if (isPrimary) {
    const hsv = normalizeHSV(primaryHue, saturation, value);

    let { v } = hsv;

    const { h, s } = hsv;

    v %= 50;
    primaryColor = chroma.hsv(h, s, v).hex();
  } else if (isSecondary) {
    const hsv = normalizeHSV(secondaryHue, saturation, value);

    let { v } = hsv;

    const { h, s } = hsv;

    v %= 50;

    secondaryColor = chroma.hsv(h, s, v).hex();
  } else if (isDivergent) {
    divergentColor = chroma
      .lch(divergentLightness, divergentChroma, divergentHue)
      .hex() as MoebiusColorValueHexType;
  }

  const colorPickerModals = document.querySelectorAll('.ph.color-picker-modal');

  if (colorPickerModals) {
    colorPickerModals.forEach((modal: HTMLDialogElement) => modal.close());
  }

  setOptions({
    baseColor: primaryColor as MoebiusColorValueHexType,
    secondaryColor,
    divergentColor
  });
};
