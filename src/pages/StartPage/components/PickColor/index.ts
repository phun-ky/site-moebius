import { Dialog } from 'components/feedback/Dialog';
import { TextInput } from 'components/input-fields/TextInput';
import { PickColorButton } from './PickColorButton';
import { Label } from 'components/input-fields/Label';
import { MoebiusColorValueHexType } from '@phun-ky/moebius';
import { addOnAfterAppRender, addOnChange, addOnClick } from 'lib/spa';
import { handleHueMapClick } from './utils/handle-hue-map-click';
import { ColorUnitsForm } from './ColorUnitsForm';
import { MouseEventType } from 'lib/spa/types';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { setOptions } from 'utils/set-options';
import { MoebiusSiteEventType } from 'types';

const html = String.raw;

export type MoebiusSitePickColorItemType = {
  type: string;
  title: string;
  color?: MoebiusColorValueHexType;
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

  return html`<fieldset class="ph color-picker-input-container ${type}-color">
    <legend class="ph">${title}</legend>
    <div class="ph color-picker-input">
      ${PickColorButton({
    id: `color-picker-input-${type}-color`,
    color: currentColor.hex,
    colorName: currentColor.name,
    className: 'color-picker-button color'
  })}
      ${Dialog({
    id: `color-picker-modal-${type}`,
    className: `color-picker-modal ${type}`,
    content: html`<div
            id="color-picker-hue-map-${type}"
            class="ph hue-map ${type}"
          ></div>
          <input
            id="color-picker-range-${type}-hue"
            class="ph color-range"
            type="range"
            step="1"
            defaultValue="${currentColorHue.toFixed()}"
            value="${currentColorHue.toFixed()}"
            min="0"
            max="359"
          />
          ${extraRangeElements}`
  })}
      ${TextInput({
    id: `color-picker-input-${type}-text`,
    label: 'Hex code',
    value: currentColor.hex.toUpperCase()
  })}
    </div>

    <button
      class="ph button color-unit-modal-toggle-button"
      id="color-units-${type}-button"
    >
      <span class="ph icon">#</span> Color units
    </button>

    ${Dialog({
    id: `color-units-${type}-modal`,
    className: 'color-units-modal',
    content: ColorUnitsForm({ color: color as MoebiusColorValueHexType })
  })}
  </fieldset>`;
};
