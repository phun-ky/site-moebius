import { cx } from 'utils/cx';
import { escapeAttribute } from 'utils/escape';
import { getA11yTextColor } from 'utils/get-a11y-text-color';

const html = String.raw;

export type MoebiusSitePickColorButton = {
  id: string;
  color: string;
  className?: string;
  colorName?: string;
  label: string;
};

export const PickColorButton = (props: MoebiusSitePickColorButton) => {
  const { id, color, className, colorName, label } = props;
  const classNames = cx(`ph ${className}`);

  return html`<button
    type="button"
    class="${classNames}"
    data-rel="${color}"
    data-color-name="${escapeAttribute(colorName)}"
    id="${id}"
    aria-label="${escapeAttribute(label)}"
    style="background-color: ${color}; color: ${getA11yTextColor(color)}"
  ></button>`;
};
