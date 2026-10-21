import {
  DEFAULT_OPTIONS,
  MoebiusSiteDefaultOptionsType,
} from 'config/constants';
import { readHashOptions } from 'utils/sanitize-options';

export const getOptions = (): MoebiusSiteDefaultOptionsType => ({
  ...DEFAULT_OPTIONS,
  ...readHashOptions(),
});
