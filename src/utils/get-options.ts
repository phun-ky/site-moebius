import {
  DEFAULT_OPTIONS,
  MoebiusSiteDefaultOptionsType
} from 'config/constants';

export const getOptions = (): MoebiusSiteDefaultOptionsType => {
  let options = {};

  try {
    const url = new URL(window.location.href);

    options = JSON.parse(atob(url.hash.replace('#options=', '')));
  } catch (e) {
    options = {};
  }

  return { ...DEFAULT_OPTIONS, ...options };
};
