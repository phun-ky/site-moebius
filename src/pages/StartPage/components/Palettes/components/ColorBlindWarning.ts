const html = String.raw;
// "deuteranopia and achromatopsia", as a sentence would list them
const list = new Intl.ListFormat('en', { type: 'conjunction' });

/**
 * A note that the palette has colors that people with some types of color
 * blindness can hardly tell apart: colors that differ clearly for most
 * people, but look almost the same through the simulation of that type.
 * @param {string[]} colorBlindCheckResult - The types that fail.
 * @returns {string} The note.
 */
export const ColorBlindWarning = (colorBlindCheckResult: string[]): string => {
  return html`<div class="ph color-blind-warning" role="note">
    <p class="ph title">Not color blind safe</p>
    <p class="ph description">
      Some colors that look different to most people look almost the same with
      <strong class="ph">${list.format(colorBlindCheckResult)}</strong>. The
      color blind simulator shows how.
    </p>
  </div>`;
};
