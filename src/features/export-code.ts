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
