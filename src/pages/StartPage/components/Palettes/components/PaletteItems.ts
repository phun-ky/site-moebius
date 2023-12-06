import { Tabs } from 'components/navigation/Tabs';
import { MoebiusSiteDefaultOptionsType } from 'config/constants';
import { paletteItemsMapper } from '../utils/palette-items-mapper';

export type MoebiusSitePaletteItemsPropsType = {
  moebius: typeof window.MoebiusPalettes;
  options: MoebiusSiteDefaultOptionsType;
};

export const PaletteItems = (props: MoebiusSitePaletteItemsPropsType) => {
  const { moebius, options } = props;
  const outputIdArray = [
    'interpolate',
    'luminanceShift',
    'monochromatic',
    'complement',
    'split',
    'triadic',
    'tetradic',
    'pentadic',
    'hexadic',
    'analogous'
  ];
  const paletteTabItems = outputIdArray.map((id) =>
    paletteItemsMapper({ id, moebius, options })
  );

  return Tabs({ id: 'palettes', items: paletteTabItems });
};
