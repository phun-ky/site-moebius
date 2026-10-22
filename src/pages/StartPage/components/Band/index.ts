import { MoebiusSiteDefaultOptionsType, PALETTE_NAMES } from 'config/constants';

import { Swatch } from '../Swatch';

import './styles/band.css';

const html = String.raw;

export type MoebiusSiteBandPropsType = {
  colors: string[];
  palette: string;
  options: MoebiusSiteDefaultOptionsType;
};

// The palette being shown, across the full width and pinned to the top of
// the window, so it stays in view while the settings change (#48). Its
// colors work like every swatch: click one to copy it and make it the
// primary color
export const Band = (props: MoebiusSiteBandPropsType) => {
  const { colors, palette, options } = props;

  return html`<section
    class="ph band"
    data-palette="${palette}"
    aria-label="The ${PALETTE_NAMES[palette]} palette"
  >
    <div class="ph swatch" id="band">${Swatch(colors, 'band', options)}</div>
  </section>`;
};
