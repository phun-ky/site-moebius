import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { MoebiusSiteEventType } from 'types';
import { copy } from './copy';
import { setOptions } from './set-options';

export const onColorClick = async (e: MoebiusSiteEventType<HTMLElement>) => {
  const element = e.target;
  const hex = element.getAttribute(
    'data-color-hex'
  ) as MoebiusColorValueHexType;

  await copy(hex);
  setOptions({
    baseColor: hex
  });
};
