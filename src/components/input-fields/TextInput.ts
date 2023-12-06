import { cx } from 'utils/cx';

const html = String.raw;

export type MoebiusSiteTextInputPropsType = {
  id: string;
  className?: string;
  value?: string;
  label?: string;
  readonly?: boolean;
};

export const TextInput = (props: MoebiusSiteTextInputPropsType) => {
  const { id, className, readonly, value, label, ...rest } = props;
  const attrs = Object.entries(rest)
    .map((attr) => {
      const [property, value] = attr;

      return ` ${property}="${value}"`;
    })
    .join(' ');
  const classNames = cx(`ph ${className}`);

  return html`<input
    type="text"
    ${readonly ? ' readonly' : ''}
    ${label ? ` aria-label="${label}"` : ''}
    class="${classNames}"
    ${attrs}
    id="${id}"
    value="${value}"
  />`;
};
