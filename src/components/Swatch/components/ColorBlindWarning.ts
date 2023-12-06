const html = String.raw;

export const ColorBlindWarning = (colorBlindCheckResult: string[]): string => {
  return html`<div class="ph message color-blind-warning">
    <span class="ph title"> Colors not safe </span>
    <p class="ph description">
      These colors are not color blind safe! Affected color blindness types are:
      ${colorBlindCheckResult.join(', ')}
    </p>
  </div>`;
};
