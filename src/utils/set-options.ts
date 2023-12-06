import { updateCSSVars } from 'pages/StartPage/components/PickColor/utils/update-css-vars';
import {
  DEFAULT_OPTIONS,
  MoebiusSiteDefaultOptionsType
} from 'config/constants';

export const setOptions = (opts: MoebiusSiteDefaultOptionsType) => {
  let savedOptions = {};

  try {
    const url = new URL(window.location.href);

    savedOptions = JSON.parse(atob(url.hash.replace('#options=', '')));
  } catch (e) {
    savedOptions = {};
  }

  const options = {
    ...DEFAULT_OPTIONS,
    ...savedOptions,
    ...opts
  };

  updateCSSVars(options);

  window.location.hash = `options=${btoa(JSON.stringify(options))}`;
};
