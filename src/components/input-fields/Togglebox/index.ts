const html = String.raw;

import { Checkbox } from '../Checkbox';
import { Label } from '../Label';
import './styles/togglebox.css';

export type MoebiusSiteToggleboxPropsType = {
  checked?: boolean;
  name: string;
  id: string;
  className?: string;
  label: string;
};

// A switch: the label names the setting, and the checkbox is drawn as a
// track with a knob. The label used to say only "on" or "off"
export const Togglebox = (props: MoebiusSiteToggleboxPropsType) => {
  const { checked = false, name, id, className = '', label } = props;

  return html`<div class="ph toggle-controls">
    ${Label({ labelFor: id, label, className: 'ph toggle-label' })}
    ${Checkbox({
      checked,
      name,
      id,
      className: `ph toggle ${className}`,
      role: 'switch'
    })}
  </div>`;
};
