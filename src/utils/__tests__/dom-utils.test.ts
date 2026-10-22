import assert from 'node:assert/strict';
import { afterEach, before, describe, it, mock } from 'node:test';

import globalJsdom from 'global-jsdom';

import { TEST_COLOR_NAMES, installMoebius } from './helpers/moebius';

// #app: init-moebius re-renders through the SPA, which needs its root
globalJsdom('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'https://moebius.wtf/'
});

const { copy } = await import('../copy');
const { getOptions } = await import('../get-options');
const { hideLoading } = await import('../hide-loading');
// Node's own CustomEvent is rejected by jsdom's dispatchEvent
globalThis.CustomEvent = window.CustomEvent;

const { initMoebius, whenColorNamesLoaded } = await import('../init-moebius');
const { onColorClick } = await import('../on-color-click');
const { setOptions } = await import('../set-options');
const { DEFAULT_OPTIONS } = await import('../../config/constants');

const stubClipboard = () => {
  const writeText = mock.fn(async () => {});

  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true
  });

  return writeText;
};

before(installMoebius);

afterEach(() => {
  location.hash = '';
  mock.restoreAll();
});

describe('hideLoading', () => {
  it('removes is-loading from the overlay', () => {
    document.body.innerHTML = '<div class="ph loading is-loading"></div>';
    hideLoading();
    assert.equal(
      document.querySelector('.ph.loading')?.className,
      'ph loading'
    );
  });

  it('does nothing without an overlay', () => {
    document.body.innerHTML = '';
    assert.doesNotThrow(hideLoading);
  });
});

describe('copy', () => {
  it('writes the text to the clipboard', async () => {
    const writeText = stubClipboard();

    await copy('#ff9900');
    assert.deepEqual(writeText.mock.calls[0].arguments, ['#ff9900']);
  });

  it('skips empty text and survives a refused clipboard', async () => {
    const writeText = stubClipboard();

    await copy('');
    assert.equal(writeText.mock.callCount(), 0);

    writeText.mock.mockImplementation(async () => {
      throw new Error('denied');
    });
    mock.method(console, 'error', () => {});
    await assert.doesNotReject(copy('#000000'));
  });
});

describe('setOptions and getOptions', () => {
  it('store options in the URL hash and read them back', () => {
    setOptions({ baseColor: '#ff0000', colorScaleMode: 'lab' });

    assert.match(location.hash, /^#options=/);
    assert.deepEqual(getOptions(), {
      ...DEFAULT_OPTIONS,
      baseColor: '#ff0000',
      colorScaleMode: 'lab'
    });
  });

  it('keep earlier options when setting new ones', () => {
    setOptions({ baseColor: '#ff0000' });
    setOptions({ diverging: true });

    assert.equal(getOptions().baseColor, '#ff0000');
    assert.equal(getOptions().diverging, true);
  });

  it('update the theme colours on the page', () => {
    setOptions({ baseColor: '#003f5c' });
    assert.notEqual(document.documentElement.style.cssText, '');
  });
});

describe('onColorClick', () => {
  it('copies the colour and makes it the base colour', async () => {
    const writeText = stubClipboard();
    const element = document.createElement('div');

    element.setAttribute('data-color-hex', '#ff9900');
    await onColorClick({ target: element } as unknown as Event);

    assert.deepEqual(writeText.mock.calls[0].arguments, ['#ff9900']);
    assert.equal(getOptions().baseColor, '#ff9900');
  });
});

describe('initMoebius', () => {
  it('does nothing when moebius is already on window', async (t) => {
    const fetchSpy = t.mock.method(globalThis, 'fetch');

    await initMoebius();
    assert.equal(fetchSpy.mock.callCount(), 0);
  });

  it('renders without names first, then loads them after the first render', async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json(TEST_COLOR_NAMES)
    );

    window.MoebiusColor = undefined;
    await initMoebius();

    assert.equal(new window.MoebiusColor('#ff9900').name, '');
    assert.equal(fetchMock.mock.callCount(), 0);

    document.dispatchEvent(new window.CustomEvent('eventAfterAppRender'));
    await whenColorNamesLoaded();

    assert.equal(
      String(fetchMock.mock.calls[0].arguments[0]),
      '/data/colornames.json'
    );
    assert.equal(new window.MoebiusColor('#ff9900').name, 'Orange');
  });

  it('keeps colours without names when the names fail to load', async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response('', { status: 503 })
    );

    const warn = t.mock.method(console, 'warn', () => {});

    window.MoebiusColor = undefined;
    await initMoebius();
    document.dispatchEvent(new window.CustomEvent('eventAfterAppRender'));
    await whenColorNamesLoaded();

    assert.equal(new window.MoebiusColor('#ff9900').name, '');
    assert.equal(warn.mock.callCount(), 1);
  });
});
