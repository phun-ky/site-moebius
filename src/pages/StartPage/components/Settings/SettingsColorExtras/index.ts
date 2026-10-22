import { Togglebox } from 'components/input-fields/Togglebox';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { setOptions } from 'utils/set-options';

import './styles/settingsColorExtras.css';

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
      (options as Record<string, unknown>)[e.target.id] = e.target.checked;

      setOptions(options);
    }
  );

  return html`<form class="ph group settings-color-extras">
    <fieldset class="ph settings-color-extras-fieldset">
      <legend class="ph group-label">Corrections</legend>

      <div class="ph settings-color-extras-inner">
        ${[
          {
            id: 'bezier',
            title: 'Bezier',
            value: options.bezier
          },
          {
            id: 'correctLightness',
            title: 'Correct lightness',
            value: options.correctLightness
          },
          {
            id: 'noDuplicates',
            title: 'No duplicates',
            value: options.noDuplicates
          },
          {
            id: 'reverseDirection',
            title: 'Reverse direction',
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
          })
          .join('\n')}
      </div>
    </fieldset>
  </form>`;
};
