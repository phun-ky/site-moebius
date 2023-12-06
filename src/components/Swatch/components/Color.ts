import { MoebiusColorInterface } from '@phun-ky/moebius';

const html = String.raw;

export type ColorPropsType = {
  color: MoebiusColorInterface;
  text: string;
  className?: string;
  backgroundColor: string;
  foregroundColor: string;
};

export const Color = (props: ColorPropsType) => {
  const { color, text, className, backgroundColor, foregroundColor } = props;

  return html`<div
    class="ph color${className ? ` ${className}` : ''}"
    style="background-color: ${backgroundColor}; color: ${foregroundColor}"
    data-rel="${color.hex}"
    data-color-hex="${color.hex}"
    data-color-name="${color.name}"
    data-color-rgb="${color.rgb}"
    data-color-hsl="${color.hsl}"
  >
    ${text}
  </div>`;
};
