// Set the theme before the first paint, so a light page doesn't flash dark.
// Same rule as resolveTheme in src/utils/theme.ts: a saved choice wins,
// otherwise the system setting decides.
(function () {
  var stored = null;

  try {
    stored = localStorage.getItem('prefers-color-scheme');
  } catch {
    // Storage blocked: fall back to the system setting
  }

  var light =
    stored === 'light' ||
    (stored !== 'dark' &&
      window.matchMedia('(prefers-color-scheme: light)').matches);

  if (light) document.documentElement.classList.add('theme--light');
})();
