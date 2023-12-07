import { Togglebox } from 'components/input-fields/Togglebox';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { setOptions } from 'utils/set-options';

import './styles/settingsColorExtras.styl';

const html = String.raw;

export type MoebiusSiteSettingsColorExtrasPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsColorExtras = (
  props: MoebiusSiteSettingsColorExtrasPropsType
) => {
  const { options } = props;

  addOnChange(
    '.ph.settings-color-extras input[type="checkbox"]',
    (e: EventType<HTMLInputElement>) => {
      options[e.target.id] = e.target.checked;

      setOptions(options);
    }
  );

  return html`<form
    class="ph settings-color-extras"
    onsubmit="javascript:return false;"
  >
    <fieldset class="ph settings-color-extras-fieldset">
      <legend class="ph">Corrections</legend>

      <div class="ph settings-color-extras-inner">
        ${[
    {
      id: 'bezier',
      title: 'bezier',
      value: options.bezier
    },
    {
      id: 'correctLightness',
      title: 'correct lightness',
      value: options.correctLightness
    },
    {
      id: 'noDuplicates',
      title: 'no duplicates',
      value: options.noDuplicates
    },
    {
      id: 'reverseDirection',
      title: 'reverse direction',
      value: options.reverseDirection
    }
  ]
    .map((setting) => {
      return Togglebox({
        checked: setting.value,
        name: setting.id,
        id: setting.id,
        label: setting.title
      });
      /*return html`<div class="ph input-group">
            ${Checkbox({
    checked: setting.value,
    name: setting.id,
    id: setting.id
  })}
            ${Label({ labelFor: setting.id, label: setting.title })}
          </div>`;

          */
    })
    .join('\n')}
      </div>
    </fieldset>
  </form>`;
};
