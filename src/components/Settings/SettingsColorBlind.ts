import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { RadioButton } from '../Input/RadioButton';
import { Label } from '../Input/Label';

const html = String.raw;

export type MoebiusSiteSettingsColorBlindPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsColorBlind = (
  props: MoebiusSiteSettingsColorBlindPropsType
) => {
  const { options } = props;

  return html`<fieldset class="ph color-blind">
    <legend class="ph">Type</legend>
    <div class="ph color-blind-inner">
      ${[
    { id: 'normal', title: 'normal' },
    { id: 'protanomaly', title: 'protanomaly' },
    { id: 'protanopia', title: 'protanopia' },
    { id: 'deuteranomaly', title: 'deuteranomaly' },
    { id: 'deuteranopia', title: 'deuteranopia' },
    { id: 'tritanomaly', title: 'tritanomaly' },
    { id: 'tritanopia', title: 'tritanopia' },
    { id: 'achromatomaly', title: 'achromatomaly' },
    { id: 'achromatopsia', title: 'achromatopsia' }
  ]
    .map((setting) => {
      return html`<div class="ph input-group">
            ${RadioButton({
    checked: setting.id === options.colorBlindSim,
    value: setting.id,
    id: `color-blind-sim-${setting.id}`,
    name: 'color-blind-sim'
  })}
            ${Label({
    labelFor: `color-blind-sim-${setting.id}`,
    label: setting.title
  })}
          </div>`;
    })
    .join('\n')}
    </div>
  </fieldset>`;
};
