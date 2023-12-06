import { cx } from 'utils/cx';

const html = String.raw;

export type MoebiusSiteTextInputPropsType = {
  id: string;
  className?: string;
  value?: string;
  readonly?: boolean;
};

export const TextInput = (props: MoebiusSiteTextInputPropsType) => {
  const { id, className, readonly, value, ...rest } = props;
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
    class="${classNames}"
    ${attrs}
    id="${id}"
    value="${value}"
  />`;
};
