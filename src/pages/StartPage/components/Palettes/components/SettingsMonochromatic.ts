import { Togglebox } from 'components/input-fields/Togglebox';
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
    ? html`<form class="ph" onsubmit="javascript:return false;">
        <fieldset class="ph">
          <legend class="ph">Settings</legend>
          <div class="ph">
            ${Togglebox({
    checked: options.randomOffset,
    name: 'random-offset',
    id: 'monochromatic-random-offset',
    label: 'random offset'
  })}
          </div>
        </fieldset>
      </form>`
    : '';
};
