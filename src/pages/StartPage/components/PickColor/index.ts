import { MoebiusColorValueHexType } from '@phun-ky/moebius';

import { Dialog } from 'components/feedback/Dialog';
import { TextInput } from 'components/input-fields/TextInput';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnAfterAppRender, addOnChange, addOnClick } from 'lib/spa';
import { MouseEventType } from 'lib/spa/types';
import { MoebiusSiteEventType } from 'types';
import { setOptions } from 'utils/set-options';

import { ColorPickerHueMap } from './ColorPickerHueMap';
import { ColorUnitsForm } from './ColorUnitsForm';
import { PickColorButton } from './PickColorButton';
import { handleHueMapClick } from './utils/handle-hue-map-click';

const html = String.raw;

export type MoebiusSitePickColorItemType = {
  type: string;
  title: string;
  color: MoebiusColorValueHexType;
};

export type MoebiusSitePickColorPropsType = {
  item: MoebiusSitePickColorItemType;
  options: MoebiusSiteDefaultOptionsType;
};

export const PickColor = (props: MoebiusSitePickColorPropsType) => {
  const { item, options } = props;
  const { type, title, color } = item;
  const { MoebiusColor } = window;
  const currentColor = new MoebiusColor(color);

  if (type === 'primary') {
    options.baseColor = color;
  } else if (type === 'secondary') {
    options.secondaryColor = color;
  } else if (type === 'divergent') {
    options.divergentColor = color;
  }

  let currentColorHue = currentColor.toObject('hsl').h;

  if (type === 'divergent') {
    currentColorHue = currentColor.lch.h;
  }

  addOnChange(
    `color-picker-input-${type}-text`,
    (e: MoebiusSiteEventType<HTMLInputElement>) => {
      if (type === 'primary') {
        setOptions({
          baseColor: e.target.value as MoebiusColorValueHexType
        });
      } else if (type === 'secondary') {
        setOptions({
          secondaryColor: e.target.value as MoebiusColorValueHexType
        });
      } else if (type === 'divergent') {
        setOptions({
          divergentColor: e.target.value as MoebiusColorValueHexType
        });
      }
    }
  );

  addOnClick(`#color-picker-input-${type}-color`, () => {
    const dialogElement: HTMLDialogElement | null = document.querySelector(
      `#color-picker-modal-${type}`
    );

    if (!dialogElement) return;

    dialogElement.showModal();
  });

  addOnClick(`#color-units-${type}-button`, () => {
    const dialogElement: HTMLDialogElement | null = document.querySelector(
      `#color-units-${type}-modal`
    );

    if (!dialogElement) return;

    dialogElement.showModal();
  });

  addOnClick(`#color-picker-modal-${type} .ph.close`, () => {
    const dialogElement: HTMLDialogElement | null = document.querySelector(
      `#color-picker-modal-${type}`
    );

    if (!dialogElement) return;

    dialogElement.close();
  });

  addOnClick(`#color-units-${type}-modal .ph.close`, () => {
    const dialogElement: HTMLDialogElement | null = document.querySelector(
      `#color-units-${type}-modal`
    );

    if (!dialogElement) return;

    dialogElement.close();
  });

  addOnClick(
    `#color-picker-hue-map-${type}`,
    (e: MouseEventType<HTMLElement>) => {
      handleHueMapClick(e, type, options);
    }
  );

  addOnAfterAppRender(() => {
    const rangeElement = document.querySelector(
      `#color-picker-range-${type}-hue`
    );

    if (rangeElement) {
      (rangeElement as HTMLInputElement).value = currentColorHue.toFixed();
    }

    const divergentChromaElement = document.querySelector('#divergent-chroma');

    if (divergentChromaElement) {
      (divergentChromaElement as HTMLInputElement).value =
        currentColor.lch.c.toFixed();
    }

    const divergentLightnessElement = document.querySelector(
      '#divergent-lightness'
    );

    if (divergentLightnessElement) {
      (divergentLightnessElement as HTMLInputElement).value =
        currentColor.lch.l.toFixed();
    }
  });

  // One row per color: the swatch opens the picker, the name says what it
  // is, the hex field takes a code, and the units button shows it in other
  // color units. Until the color names load (#82) the name is a dash, so
  // the element paints at once; the name filling in later then doesn't
  // count as the page's largest paint, which would put it seconds late
  return html`<div
    class="ph color-row ${type}-color"
    role="group"
    aria-labelledby="color-row-${type}"
  >
    ${PickColorButton({
      id: `color-picker-input-${type}-color`,
      color: currentColor.hex,
      colorName: currentColor.name,
      label: `Change the ${title.toLowerCase()} color, now ${currentColor.name}`,
      className: 'color-picker-button color'
    })}
    <p class="ph color-row-name" id="color-row-${type}">
      <span class="ph color-row-label">${title}</span>
      <strong class="ph">${currentColor.name || '–'}</strong>
    </p>
    ${TextInput({
      id: `color-picker-input-${type}-text`,
      label: `${title} color, hex code`,
      value: currentColor.hex.toUpperCase()
    })}
    <button
      type="button"
      class="ph button color-unit-modal-toggle-button"
      id="color-units-${type}-button"
      aria-label="The ${title.toLowerCase()} color in other units"
    >
      Aa
    </button>
    ${Dialog({
      id: `color-picker-modal-${type}`,
      className: `color-picker-modal ${type}`,
      content: ColorPickerHueMap({ type, color })
    })}
    ${Dialog({
      id: `color-units-${type}-modal`,
      className: 'color-units-modal',
      content: ColorUnitsForm({
        color: color as MoebiusColorValueHexType,
        type
      })
    })}
  </div>`;
};
