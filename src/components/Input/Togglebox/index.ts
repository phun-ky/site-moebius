const html = String.raw;

import { Checkbox } from '../Checkbox';
import { Label } from '../Label';
import './styles/togglebox.styl';

export type MoebiusSiteToggleboxPropsType = {
  checked?: boolean;
  name: string;
  id: string;
  className?: string;
  label: string;
};

export const Togglebox = (props: MoebiusSiteToggleboxPropsType) => {
  const { checked = false, name, id, className = '', label } = props;

  return html`<div class="ph toggle-controls">
    ${label}
    ${Checkbox({ checked, name, id, className: `ph toggle ${className}` })}
    ${Label({ labelFor: id, label: checked ? 'on' : 'off' })}
  </div>`;
};
