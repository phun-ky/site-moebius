import { MoebiusColorValueHexType } from '@phun-ky/moebius';

import { MoebiusSiteEventType } from 'types';

import { copy } from './copy';
import { setOptions } from './set-options';

/**
 * Enter or Space on a focused swatch does what a click does.
 * @param {Event} event - The keydown event.
 */
export const onColorKeydown = async (event: Event) => {
  const { key } = event as KeyboardEvent;

  if (key !== 'Enter' && key !== ' ') return;

  event.preventDefault();
  await onColorClick(event);
};

export const onColorClick = async (event: Event) => {
  const element = (event as MoebiusSiteEventType<HTMLElement>).target;
  const hex = element.getAttribute(
    'data-color-hex'
  ) as MoebiusColorValueHexType;

  await copy(hex);
  setOptions({
    baseColor: hex
  });
};
