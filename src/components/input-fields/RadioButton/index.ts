const html = String.raw;

import { uniqueID } from 'utils/unique-id';
import './styles/radioButton.styl';

export type MoebiusSiteRadioButtonPropsType = {
  checked?: boolean;
  value: string;
  name: string;
  id?: string;
  className?: string;
};

export const RadioButton = (props: MoebiusSiteRadioButtonPropsType) => {
  const {
    checked = false,
    value,
    name,
    id = uniqueID(),
    className = 'ph'
  } = props;
  const checkedAttribute = checked ? 'checked="checked"' : '';

  return html`<input
    type="radio"
    name="${name}"
    ${checkedAttribute}
    value="${value}"
    id="${id}"
    class="${className}"
  />`;
};
