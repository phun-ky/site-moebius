import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { RadioButton } from 'components/input-fields/RadioButton';
import { Label } from 'components/input-fields/Label';
import { uniqueID } from 'utils/unique-id';

import './styles/settingsColorBlind.styl';

const html = String.raw;

export type MoebiusSiteSettingsColorBlindPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsColorBlind = (
  props: MoebiusSiteSettingsColorBlindPropsType
) => {
  const { options } = props;
  const id = uniqueID();

  return html`<form
    class="ph color-blind-simulator"
    onsubmit="javascript:return false;"
  >
    <fieldset class="ph color-blind">
      <legend class="ph">Color blind simulator</legend>
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
    id,
    name: 'color-blind-sim'
  })}
              ${Label({
    labelFor: id,
    label: setting.title
  })}
            </div>`;
    })
    .join('\n')}
      </div>
    </fieldset>
  </form>`;
};
