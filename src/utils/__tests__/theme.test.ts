import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import fc from 'fast-check';

import { resolveTheme } from '../theme';

const THEME_SCRIPT = readFileSync(
  new URL('../../../public/js/theme.js', import.meta.url),
  'utf8'
);
// Run public/js/theme.js against fake browser globals and report the
// theme it set
const runThemeScript = (
  stored: string | null,
  systemPrefersLight: boolean,
  storageThrows = false
) => {
  const classes = new Set<string>();

  runInNewContext(THEME_SCRIPT, {
    localStorage: {
      getItem: () => {
        if (storageThrows) throw new Error('blocked');

        return stored;
      },
    },
    window: { matchMedia: () => ({ matches: systemPrefersLight }) },
    document: {
      documentElement: {
        classList: { add: (name: string) => classes.add(name) },
      },
    },
  });

  return classes.has('theme--light') ? 'light' : 'dark';
};

describe('resolveTheme', () => {
  it('uses a saved choice over the system setting', () => {
    assert.equal(resolveTheme('light', false), 'light');
    assert.equal(resolveTheme('dark', true), 'dark');
  });

  it('follows the system setting when nothing valid is saved', () => {
    assert.equal(resolveTheme(null, true), 'light');
    assert.equal(resolveTheme(null, false), 'dark');
    assert.equal(resolveTheme('blue', true), 'light');
  });

  it('always returns light or dark', () => {
    fc.assert(
      fc.property(fc.anything(), fc.boolean(), (stored, light) => {
        assert.ok(['light', 'dark'].includes(resolveTheme(stored, light)));
      })
    );
  });
});

describe('theme.js, the script that runs before the first paint', () => {
  it('decides the same as resolveTheme for every case', () => {
    for (const stored of [null, 'light', 'dark', 'blue']) {
      for (const light of [true, false]) {
        assert.equal(
          runThemeScript(stored, light),
          resolveTheme(stored, light),
          `${stored} ${light}`
        );
      }
    }
  });

  it('falls back to the system setting when storage is blocked', () => {
    assert.equal(runThemeScript(null, true, true), 'light');
    assert.equal(runThemeScript(null, false, true), 'dark');
  });
});
