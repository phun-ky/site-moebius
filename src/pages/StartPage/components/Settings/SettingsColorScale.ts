import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { RadioButton } from 'components/input-fields/RadioButton';
import { Label } from 'components/input-fields/Label';

const html = String.raw;

export type MoebiusSiteSettingsColorScalePropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsColorScale = (
  props: MoebiusSiteSettingsColorScalePropsType
) => {
  const { options } = props;

  return html`<fieldset class="ph color-scale">
    <legend class="ph">Color scale method</legend>
    <div class="ph color-scale-inner">
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
  </fieldset>`;
};
