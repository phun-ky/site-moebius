import './styles/checkbox.css';

const html = String.raw;

export type MoebiusSiteCheckboxPropsType = {
  checked?: boolean;
  name: string;
  id: string;
  className?: string;
  // Such as 'switch', for a checkbox that turns something on and off
  role?: string;
};

export const Checkbox = (props: MoebiusSiteCheckboxPropsType) => {
  const { checked = false, name, id, className = 'ph', role } = props;
  const checkedAttribute = checked ? 'checked="checked"' : '';

  return html`<input
    type="checkbox"
    ${checkedAttribute}
    name="${name}"
    id="${id}"
    class="${className}"
    ${role ? `role="${role}"` : ''}
  />`;
};
