import { MoebiusSiteDefaultOptionsType } from 'config/constants';

const html = String.raw;

export type MoebiusSiteSettingsMonochromaticPropsType = {
  id: string;
  options: MoebiusSiteDefaultOptionsType;
};

export const SettingsMonochromatic = (
  props: MoebiusSiteSettingsMonochromaticPropsType
) => {
  const { id, options } = props;

  return id === 'monochromatic'
    ? html`<form class="ph color-settings" onsubmit="javascript:return false;">
        <fieldset class="ph color-extras">
          <legend class="ph">Settings</legend>
          <div class="ph color-extras-inner">
            <div class="ph input-group">
              <input
                type="checkbox"
                name="random-offset"
                id="monochromatic-random-offset"
                ${options.randomOffset ? 'checked="checked"' : ''}
                class="ph"
              />
              <label for="random-offset" class="ph">random offset</label>
            </div>
          </div>
        </fieldset>
      </form>`
    : '';
};
