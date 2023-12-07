const html = String.raw;

import './styles/rangeInput.styl';

export type MoebiusSiteRangeInputPropsType = {
  id: string;
  className?: string;
  step?: number;
  value: string;
  min: number;
  label?: string;
  max: number;
};

export const RangeInput = (props: MoebiusSiteRangeInputPropsType) => {
  const { id, className, step = 1, value, min, max, label } = props;

  return html`<input
    id="${id}"
    class="ph${className ? ` ${className}` : ''}"
    type="range"
    step="${step}"
    defaultValue="${value}"
    value="${value}"
    ${label ? ` aria-label="${label}"` : ''}
    ${typeof min === 'number' ? ` min="${min}"` : ''}
    ${max ? ` max="${max}"` : ''}
  />`;
};
