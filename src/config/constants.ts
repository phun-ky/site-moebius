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
  // The palette shown in the band and the results
  palette?: string;
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
  colorBlindSim: 'normal',
  palette: 'interpolate'
};

// What the page calls each palette moebius makes
export const PALETTE_NAMES: Record<string, string> = {
  interpolate: 'Interpolate',
  luminanceShift: 'Luminance shift',
  monochromatic: 'Monochromatic',
  complement: 'Complement',
  split: 'Split complementary',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  pentadic: 'Pentadic',
  hexadic: 'Hexadic',
  analogous: 'Analogous'
};
