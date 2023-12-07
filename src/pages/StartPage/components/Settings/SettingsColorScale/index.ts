import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { RadioButton } from 'components/input-fields/RadioButton';
import { Label } from 'components/input-fields/Label';
import { addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { setOptions } from 'utils/set-options';

import './styles/settingsColorScale.styl';

const html = String.raw;

export type MoebiusSiteSettingsColorScalePropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsColorScale = (
  props: MoebiusSiteSettingsColorScalePropsType
) => {
  const { options } = props;

  addOnChange(
    '.ph.settings-color-scale input[type="radio"]',
    (e: EventType<HTMLInputElement>) => {
      setOptions({ colorScaleMode: e.target.value });
    }
  );

  return html` <form
    class="ph settings-color-scale"
    onsubmit="javascript:return false;"
  >
    <fieldset class="ph settings-color-scale-fieldset">
      <legend class="ph">Color scale method</legend>
      <div class="ph settings-color-scale-inner">
        ${[
    { id: 'rgb', title: 'rgb' },
    { id: 'lab', title: 'lab' },
    { id: 'lrgb', title: 'lrgb' },
    { id: 'hsl', title: 'hsl' },
    { id: 'lch', title: 'lch' }
  ]
    .map((setting) => {
      return html`<div class="ph input-group">
              ${RadioButton({
    checked: setting.id === options.colorScaleMode,
    value: setting.id,
    id: `color-scale-${setting.id}`,
    name: 'color-scale'
  })}
              ${Label({
    labelFor: `color-scale-${setting.id}`,
    label: setting.title
  })}
            </div>`;
    })
    .join('\n')}
      </div>
    </fieldset>
  </form>`;
};
