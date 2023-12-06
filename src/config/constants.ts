import { MoebiusColorValueHexType } from '@phun-ky/moebius';

export type MoebiusSiteDefaultOptionsType = {
  baseColor?: MoebiusColorValueHexType;
  secondaryColor?: MoebiusColorValueHexType;
  divergentColor?: MoebiusColorValueHexType;
  diverging?: boolean;
  bezier?: boolean;
  reverseDirection?: boolean;
  randomOffset?: boolean;
  correctLightness?: boolean;
  noDuplicates?: boolean;
  colorScaleMode?: string;
  numberOfColors?: number;
  colorBlindSim?: string;
};

export const DEFAULT_OPTIONS: MoebiusSiteDefaultOptionsType = {
  baseColor: '#003f5c',
  secondaryColor: '#ff9900',
  divergentColor: '#f5f5f5',
  diverging: false,
  bezier: false,
  reverseDirection: false,
  randomOffset: false,
  correctLightness: false,
  noDuplicates: false,
  colorScaleMode: 'rgb',
  numberOfColors: 7,
  colorBlindSim: 'normal'
};
