import { cx } from 'utils/cx';
import { getA11yTextColor } from 'utils/get-a11y-text-color';

const html = String.raw;

export type MoebiusSitePickColorButton = {
  id: string;
  color: string;
  className?: string;
  colorName?: string;
};

export const PickColorButton = (props: MoebiusSitePickColorButton) => {
  const { id, color, className, colorName } = props;
  const classNames = cx(`ph ${className}`);

  return html`<button
    type="button"
    class="${classNames}"
    data-rel="${color}"
    data-color-name="${colorName}"
    id="${id}"
    aria-label="Pick a ${id} color"
    style="background-color: ${color}; color: ${getA11yTextColor(color)}"
  ></button>`;
};
