import { MoebiusColorValueHexType } from '@phun-ky/moebius';

import { copy } from 'utils/copy';
import { css } from 'utils/export/css';
import { js } from 'utils/export/js';
import { tokens } from 'utils/export/tokens';

// The formats the code box offers, in its order (#48, #96)
export const CODE_FORMATS = [
  { id: 'css', name: 'CSS', language: 'css' },
  { id: 'js', name: 'JavaScript', language: 'js' },
  { id: 'tokens', name: 'Design tokens', language: 'json' }
];

/**
 * A palette's code in one of the formats.
 * @param {string} format - `css`, `js` or `tokens`.
 * @param {MoebiusColorValueHexType[]} colors - The palette's colors.
 * @param {MoebiusColorValueHexType[][]} accents - Each color's shades.
 * @param {string} palette - The palette's name, such as `interpolate`.
 * @returns {string} The code.
 * @throws {RangeError} For a format the code box doesn't offer.
 */
export const exportCode = (
  format: string,
  colors: MoebiusColorValueHexType[],
  accents: MoebiusColorValueHexType[][],
  palette: string
): string => {
  if (format === 'css') return css(colors, accents);

  if (format === 'js') return js(colors, accents);

  if (format === 'tokens') return tokens(colors, accents, palette);

  throw new RangeError(`No code format called ${format}`);
};

/**
 * Highlight the code in the code box. It runs on its own turn after the
 * page has rendered, so the highlighting doesn't hold up the first paint
 * (#82).
 */
export const highlightCode = (): void => {
  setTimeout(() => {
    document
      .querySelectorAll<HTMLElement>('.ph.code-box pre code')
      .forEach((element) => window.Prism?.highlightElement(element));
  }, 0);
};

// How long a copy button says what happened before it reads "copy" again
const COPY_FEEDBACK_MS = 2000;

/**
 * Copy the code in the code block a copy button belongs to. The button
 * says whether it worked, and so does a status message for screen readers.
 * @param {HTMLButtonElement} button - The copy button.
 * @returns {Promise<boolean>} Whether the code was copied.
 */
export const copyCode = async (button: HTMLButtonElement): Promise<boolean> => {
  const toolbar = button.closest('.ph.code-toolbar');
  const language = toolbar?.querySelector('.ph.language')?.textContent ?? '';
  const status = toolbar?.querySelector('.ph.copy-status');
  const copied = await copy(toolbar?.querySelector('code')?.textContent ?? '');

  button.textContent = copied ? 'copied' : 'copy failed';

  if (status) {
    status.textContent = copied
      ? `${language} code copied`
      : `Could not copy the ${language} code`;
  }

  setTimeout(() => {
    button.textContent = 'copy';

    if (status) status.textContent = '';
  }, COPY_FEEDBACK_MS);

  return copied;
};

// The code blocks are re-rendered with the palettes, so one listener on the
// document handles every copy button
document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest?.(
    '.ph.code-toolbar .ph.copy'
  );

  if (button instanceof HTMLButtonElement) void copyCode(button);
});
