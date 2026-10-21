import {
  DEFAULT_OPTIONS,
  MoebiusSiteDefaultOptionsType
} from 'config/constants';
import { updateCSSVars } from 'pages/StartPage/components/PickColor/utils/update-css-vars';
import { readHashOptions } from 'utils/sanitize-options';

export const setOptions = (opts: MoebiusSiteDefaultOptionsType) => {
  const options = {
    ...DEFAULT_OPTIONS,
    ...readHashOptions(),
    ...opts
  };

  updateCSSVars(options);

  window.location.hash = `options=${btoa(JSON.stringify(options))}`;
};
