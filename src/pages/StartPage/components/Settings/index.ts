import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { SettingsColorExtras } from './SettingsColorExtras';
import { SettingsColorScale } from './SettingsColorScale';

import './styles/settings.styl';

const html = String.raw;

export type MoebiusSiteSettingsPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

export const Settings = (props: MoebiusSiteSettingsPropsType) => {
  const { options } = props;

  return html`<div class="ph settings">
    <h2 class="ph">Options</h2>

    ${SettingsColorScale({ options })} ${SettingsColorExtras({ options })}
  </div>`;
};
