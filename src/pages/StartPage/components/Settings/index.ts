import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { setOptions } from 'utils/set-options';
import { SettingsColorExtras } from './SettingsColorExtras';
import { SettingsColorScale } from './SettingsColorScale';
import { SettingsColorBlind } from './SettingsColorBlind';

const html = String.raw;

export type MoebiusSiteSettingsPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const Settings = (props: MoebiusSiteSettingsPropsType) => {
  const { options } = props;

  addOnChange(
    '.ph.settings .ph.color-blind-simulator input[type="radio"]',
    (e: EventType<HTMLInputElement>) => {
      setOptions({ colorBlindSim: e.target.value });
    }
  );

  addOnChange(
    '.ph.settings .ph.color-scale input[type="radio"]',
    (e: EventType<HTMLInputElement>) => {
      setOptions({ colorScaleMode: e.target.value });
    }
  );

  addOnChange(
    '.ph.settings .ph.color-extras input[type="checkbox"]',
    (e: EventType<HTMLInputElement>) => {
      options[e.target.id] = e.target.checked;

      setOptions(options);
    }
  );

  return html`<aside class="ph settings">
    <h2 class="ph">Options</h2>

    <form
      class="ph color-settings color-options"
      onsubmit="javascript:return false;"
    >
      ${SettingsColorScale({ options })} ${SettingsColorExtras({ options })}
    </form>
  </aside>`;
};
