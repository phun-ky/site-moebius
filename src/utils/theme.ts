// The theme is the `theme--light` class on <html>; without it the site is
// dark. A choice made with the theme button is saved under this key and wins;
// without one, the system setting decides. src/assets/js/theme.js applies
// the same rule before the first paint.
export const THEME_STORAGE_KEY = 'prefers-color-scheme';

export type ThemeType = 'light' | 'dark';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * Decide the theme from a saved choice and the system setting.
 * @param {unknown} stored - What localStorage holds, if anything.
 * @param {boolean} systemPrefersLight - Whether the system asks for light.
 * @returns {ThemeType} The theme to use.
 */
export const resolveTheme = (
  stored: unknown,
  systemPrefersLight: boolean
): ThemeType => {
  if (stored === 'light' || stored === 'dark') return stored;

  return systemPrefersLight ? 'light' : 'dark';
};

const readStored = (): string | null => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};
const applyTheme = (theme: ThemeType): void => {
  document.documentElement.classList.toggle('theme--light', theme === 'light');
};

/**
 * Switch the theme and save the choice.
 */
export const toggleTheme = (): void => {
  const next: ThemeType = document.documentElement.classList.contains(
    'theme--light'
  )
    ? 'dark'
    : 'light';

  applyTheme(next);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // The choice still applies to this page view
  }
};

/**
 * Listen for clicks on the theme button, once for the whole page (the button
 * is re-rendered, so the listener is delegated), and follow changes to the
 * system setting while no choice is saved.
 */
export const initTheme = (): void => {
  document.addEventListener('click', (event) => {
    if ((event.target as Element | null)?.closest?.('.ph.darkmode-button')) {
      toggleTheme();
    }
  });

  const query = window.matchMedia(LIGHT_QUERY);

  query.addEventListener('change', () => {
    if (readStored() === null) applyTheme(resolveTheme(null, query.matches));
  });
};
