import { Label } from 'components/input-fields/Label';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { COLOR_BLIND_SIM_TYPES } from 'utils/sanitize-options';
import { setOptions } from 'utils/set-options';

const html = String.raw;

export type MoebiusSiteSettingsColorBlindPropsType = {
  options: MoebiusSiteDefaultOptionsType;
};

// A menu rather than nine radio buttons, so it fits the settings panel
export const SettingsColorBlind = (
  props: MoebiusSiteSettingsColorBlindPropsType
) => {
  const { options } = props;

  addOnChange('color-blind-sim', (e: EventType<HTMLSelectElement>) => {
    setOptions({ colorBlindSim: e.target.value as string });
  });

  // Untagged, so Prettier keeps each option on one line: diff-dom can't read
  // a closing tag split over lines
  const choices = COLOR_BLIND_SIM_TYPES.map(
    (type) =>
      `<option value="${type}"${type === options.colorBlindSim ? ' selected' : ''}>${type}</option>`
  ).join('');

  return html`<div class="ph group color-blind-simulator">
    ${Label({
      labelFor: 'color-blind-sim',
      label: 'Color blind simulator',
      className: 'ph group-label'
    })}
    <div class="ph select">
      <select class="ph" id="color-blind-sim">
        ${choices}
      </select>
    </div>
  </div>`;
};
