import { Tabs } from 'components/navigation/Tabs';
import { MoebiusSiteDefaultOptionsType, PALETTE_NAMES } from 'config/constants';
import { PALETTE_TYPES } from 'utils/sanitize-options';
import { setOptions } from 'utils/set-options';

import { paletteItemsMapper } from '../utils/palette-items-mapper';

export type MoebiusSitePaletteItemsPropsType = {
  moebius: typeof window.MoebiusPalettes;
  options: MoebiusSiteDefaultOptionsType;
};

export const PaletteItems = (props: MoebiusSitePaletteItemsPropsType) => {
  const { moebius, options } = props;
  const paletteTabItems = PALETTE_TYPES.map((id) => ({
    ...paletteItemsMapper({ id, moebius, options }),
    name: PALETTE_NAMES[id]
  }));

  // The chosen palette is an option, like the rest, so the band shows the
  // same one and a shared link keeps it
  return Tabs({
    id: 'palettes',
    items: paletteTabItems,
    active: options.palette,
    onSelect: (palette) => setOptions({ palette })
  });
};
