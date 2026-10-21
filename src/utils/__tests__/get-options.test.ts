import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { DEFAULT_OPTIONS } from 'config/constants';

import { getOptions } from '../get-options';

const withHash = (options: unknown) => {
  const hash = Buffer.from(JSON.stringify(options)).toString('base64');

  globalThis.window = {
    location: { href: `https://moebius.wtf/#options=${hash}` },
  } as unknown as Window & typeof globalThis;
};

describe('getOptions', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('falls back to the defaults for markup in a crafted link', () => {
    const payload = '"><img src=x onerror="alert(1)">';

    withHash({ baseColor: payload, colorScaleMode: payload });

    assert.deepEqual(getOptions(), DEFAULT_OPTIONS);
  });

  it('falls back to the default for an Object.prototype simulation type', () => {
    withHash({ colorBlindSim: '__proto__' });

    assert.equal(getOptions().colorBlindSim, DEFAULT_OPTIONS.colorBlindSim);
  });

  it('keeps valid options from the link', () => {
    withHash({ baseColor: '#ff0000', colorScaleMode: 'lab' });

    const options = getOptions();

    assert.equal(options.baseColor, '#ff0000');
    assert.equal(options.colorScaleMode, 'lab');
  });
});
