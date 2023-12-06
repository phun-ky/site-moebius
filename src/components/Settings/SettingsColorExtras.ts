import { Checkbox } from 'components/Input/Checkbox';
import { Label } from 'components/Input/Label';
import { Togglebox } from 'components/Input/Togglebox';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';

const html = String.raw;

export type MoebiusSiteSettingsColorExtrasPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsColorExtras = (
  props: MoebiusSiteSettingsColorExtrasPropsType
) => {
  const { options } = props;

  return html`<fieldset class="ph color-extras">
    <legend class="ph">Corrections</legend>

    <div class="ph color-extras-inner">
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
  </fieldset> `;
};
