import { MoebiusSiteDefaultOptionsType } from 'config/constants';

import { MoebiusSitePickColorItemType, PickColor } from '../PickColor';

import { SettingsColorBlind } from './SettingsColorBlind';
import { SettingsColorExtras } from './SettingsColorExtras';
import { SettingsColorScale } from './SettingsColorScale';

import './styles/settings.css';

const html = String.raw;

export type MoebiusSiteSettingsPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

// Everything that changes the palettes, in one panel beside the results
// (#48): the colors, how they blend, the corrections and the color blind
// simulator
export const Settings = (props: MoebiusSiteSettingsPropsType) => {
  const { options } = props;
  const colors: MoebiusSitePickColorItemType[] = [
    { type: 'primary', title: 'Primary', color: options.baseColor! },
    { type: 'secondary', title: 'Secondary', color: options.secondaryColor! },
    { type: 'divergent', title: 'Divergent', color: options.divergentColor! }
  ];

  return html`<aside
    class="ph settings-panel"
    aria-labelledby="settings-heading"
  >
    <h2 class="ph" id="settings-heading">Settings</h2>
    <div class="ph group colors">
      <h3 class="ph group-label">Colors</h3>
      ${colors.map((item) => PickColor({ item, options })).join('\n')}
    </div>
    ${SettingsColorScale({ options })} ${SettingsColorExtras({ options })}
    ${SettingsColorBlind({ options })}
  </aside>`;
};
