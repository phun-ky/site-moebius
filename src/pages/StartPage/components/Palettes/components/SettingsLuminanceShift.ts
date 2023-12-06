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
    ? html`<form class="ph color-settings" onsubmit="javascript:return false;">
        <fieldset class="ph color-extras">
          <legend class="ph">Settings</legend>
          <div class="ph color-extras-inner">
            <div class="ph input-group">
              <input
                type="checkbox"
                name="diverging"
                id="luminanceShift-diverging"
                ${options.diverging ? 'checked="checked"' : ''}
                class="ph"
              />
              <label for="diverging" class="ph">diverging</label>
            </div>
          </div>
        </fieldset>
      </form>`
    : '';
};
