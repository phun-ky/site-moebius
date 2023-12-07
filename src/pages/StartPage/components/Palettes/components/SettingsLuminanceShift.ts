import { Togglebox } from 'components/input-fields/Togglebox';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';

const html = String.raw;

export type MoebiusSiteSettingsLuminanceShiftPropsType = {
  id: string;
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsLuminanceShift = (
  props: MoebiusSiteSettingsLuminanceShiftPropsType
) => {
  const { id, options } = props;

  return id === 'luminanceShift'
    ? html`<form class="ph" onsubmit="javascript:return false;">
        <fieldset class="ph">
          <legend class="ph">Settings</legend>
          <div class="ph">
            ${Togglebox({
    checked: options.diverging,
    name: 'diverging',
    id: 'luminanceShift-diverging',
    label: 'diverging'
  })}
          </div>
        </fieldset>
      </form>`
    : '';
};
