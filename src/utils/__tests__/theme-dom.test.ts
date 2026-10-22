import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import globalJsdom from 'global-jsdom';

globalJsdom(
  '<!doctype html><html><body><button class="ph darkmode-button"><svg><path></path></svg></button></body></html>',
  {
    url: 'https://moebius.wtf/'
  }
);

// Node 26 has its own global localStorage, which global-jsdom leaves alone;
// use jsdom's, as the browser would
Object.defineProperty(globalThis, 'localStorage', {
  value: window.localStorage,
  configurable: true
});

// A matchMedia whose result and change listeners the tests control
let systemLight = false;
const listeners: (() => void)[] = [];

window.matchMedia = ((query: string) => ({
  get matches() {
    return query.includes('light') ? systemLight : !systemLight;
  },
  media: query,
  addEventListener: (_type: string, listener: () => void) =>
    listeners.push(listener)
})) as unknown as typeof window.matchMedia;

const { THEME_STORAGE_KEY, initTheme, toggleTheme } = await import('../theme');

const isLight = () =>
  document.documentElement.classList.contains('theme--light');

initTheme();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('theme--light');
  systemLight = false;
});

describe('toggleTheme', () => {
  it('switches the theme and saves the choice', () => {
    toggleTheme();
    assert.equal(isLight(), true);
    assert.equal(localStorage.getItem(THEME_STORAGE_KEY), 'light');

    toggleTheme();
    assert.equal(isLight(), false);
    assert.equal(localStorage.getItem(THEME_STORAGE_KEY), 'dark');
  });
});

describe('initTheme', () => {
  it('toggles once per click on the button, also on its icon', () => {
    document.querySelector<HTMLElement>('.ph.darkmode-button')!.click();
    assert.equal(isLight(), true);

    document
      .querySelector('.ph.darkmode-button path')!
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.equal(isLight(), false);
  });

  it('ignores clicks elsewhere', () => {
    document.body.click();
    assert.equal(isLight(), false);
  });

  it('follows a system change while nothing is saved', () => {
    systemLight = true;
    listeners.forEach((listener) => listener());
    assert.equal(isLight(), true);
  });

  it('keeps a saved choice when the system changes', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    systemLight = true;
    listeners.forEach((listener) => listener());
    assert.equal(isLight(), false);
  });
});
