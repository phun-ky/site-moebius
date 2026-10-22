import { copy } from 'utils/copy';
import { css } from 'utils/export/css';
import { js } from 'utils/export/js';

// The palettes on the page, for the export code of a palette that is opened
let currentPalettes: typeof window.MoebiusPalettes | undefined;

/**
 * Remember the palettes the page shows.
 * @param {typeof window.MoebiusPalettes} palettes - The current palettes.
 */
export const setCurrentPalettes = (
  palettes: typeof window.MoebiusPalettes
): void => {
  currentPalettes = palettes;
};

/**
 * Fill and highlight the CSS and JavaScript code of one palette. The code
 * is only made when its section is opened: making and highlighting it for
 * every palette on every render was a large part of the start page's
 * first render (#82).
 * @param {HTMLDetailsElement} details - The opened code section.
 */
export const fillExportCode = (details: HTMLDetailsElement): void => {
  const id = details.dataset.palette;

  if (!id || !currentPalettes) return;

  const { colors, accents } = currentPalettes;
  const code = {
    css: css(colors[id], accents[id]),
    js: js(colors[id], accents[id])
  };

  for (const [language, content] of Object.entries(code)) {
    const element = details.querySelector<HTMLElement>(
      `#${id}-code-${language}`
    );

    if (!element || element.textContent === content) continue;

    element.textContent = content;
    window.Prism?.highlightElement(element);
  }
};

// toggle doesn't bubble, so listen while it is captured
document.addEventListener(
  'toggle',
  (event) => {
    const details = event.target;

    if (
      details instanceof HTMLDetailsElement &&
      details.open &&
      details.matches('.ph.export-code')
    ) {
      fillExportCode(details);
    }
  },
  true
);

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
