import './styles/checkbox.styl';

const html = String.raw;

export type MoebiusSiteCheckboxPropsType = {
  checked?: boolean;
  name: string;
  id: string;
  className?: string;
};

export const Checkbox = (props: MoebiusSiteCheckboxPropsType) => {
  const { checked = false, name, id, className = 'ph' } = props;
  const checkedAttribute = checked ? 'checked="checked"' : '';

  return html`<input
    type="checkbox"
    ${checkedAttribute}
    name="${name}"
    id="${id}"
    class="${className}"
  />`;
};
