import { checkType } from './check-type';

export const colorBlindCheck = (colors: string[]): string[] => {
  const types = [
    'protanomaly',
    'protanopia',
    'deuteranomaly',
    'deuteranopia',
    'tritanomaly',
    'tritanopia',
    'achromatomaly',
    'achromatopsia'
  ];
  const invalid: string[] = [];

  for (let i = 0; i < types.length; i++) {
    if (!checkType(colors, types[i])) invalid.push(types[i]);
  }

  return invalid;
};
