import { MoebiusHSVObjectType } from '@phun-ky/moebius';

export const normalizeHSV = (
  hue: number,
  saturation: number,
  value: number
): MoebiusHSVObjectType => {
  const h = hue;
  const s = Math.round(saturation * 100) / 100;
  const v = Math.round(value * 100) / 100;

  return {
    h,
    s,
    v
  };
};
