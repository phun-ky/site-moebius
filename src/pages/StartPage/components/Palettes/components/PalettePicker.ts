import { PALETTE_NAMES } from 'config/constants';
import { addOnChange } from 'lib/spa';
import { EventType } from 'lib/spa/types';
import { PALETTE_TYPES } from 'utils/sanitize-options';
import { setOptions } from 'utils/set-options';

const html = String.raw;

export type MoebiusSitePalettePickerPropsType = {
  moebius: typeof window.MoebiusPalettes;
  active: string;
};

/**
 * One tile, with a preview strip of the palette. It is built untagged, so
 * Prettier keeps it on one line: diff-dom can't read a closing tag split
 * over lines.
 * @param {string} id - The palette.
 * @param {string[]} colors - Its colors.
 * @param {boolean} checked - Whether it is the one shown.
 * @returns {string} The tile.
 */
const option = (id: string, colors: string[], checked: boolean) =>
  `<label class="ph palette-option"><input class="ph" type="radio" name="palette" value="${id}"${checked ? ' checked' : ''}><span class="ph palette-option-name">${PALETTE_NAMES[id]}</span><span class="ph mini" aria-hidden="true">${colors.map((hex) => `<i style="background-color: ${hex}"></i>`).join('')}</span></label>`;

// The palettes moebius makes, as radio buttons drawn as tiles (#48): the
// browser handles the arrow keys and tells screen readers which is chosen
export const PalettePicker = (props: MoebiusSitePalettePickerPropsType) => {
  const { moebius, active } = props;

  addOnChange(
    '.ph.palette-picker input[type="radio"]',
    (e: EventType<HTMLInputElement>) => {
      setOptions({ palette: e.target.value as string });
    }
  );

  return html`<fieldset
    class="ph palette-picker"
    aria-labelledby="palette-heading"
  >
    ${PALETTE_TYPES.map((id) => option(id, moebius.colors[id], id === active)).join('')}
  </fieldset>`;
};
