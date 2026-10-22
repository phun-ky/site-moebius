import assert from 'node:assert/strict';
import { before, describe, it, mock } from 'node:test';

import globalJsdom from 'global-jsdom';

import { installMoebius } from '../../utils/__tests__/helpers/moebius';

globalJsdom('<!doctype html><html><body></body></html>', {
  url: 'https://moebius.wtf/'
});

const { CODE_FORMATS, copyCode, exportCode } = await import('../export-code');

before(installMoebius);

describe('exportCode', () => {
  const colors: `#${string}`[] = ['#003f5c', '#ff9900'];
  const accents: `#${string}`[][] = [['#003f5c'], ['#ff9900']];

  it('writes every format the code box offers', () => {
    for (const { id } of CODE_FORMATS) {
      assert.match(
        exportCode(id, colors, accents, 'interpolate'),
        /#003f5c/,
        id
      );
    }
  });

  it('writes CSS, JavaScript and parsable design tokens', () => {
    assert.match(exportCode('css', colors, accents, 'x'), /^:root\{/);
    assert.match(exportCode('js', colors, accents, 'x'), /'#ff9900'/);
    assert.equal(
      JSON.parse(exportCode('tokens', colors, accents, 'triadic')).triadic['2']
        .$value.hex,
      '#ff9900'
    );
  });

  it('throws RangeError for a format it does not know', () => {
    assert.throws(() => exportCode('yaml', colors, accents, 'x'), RangeError);
  });
});

describe('copy button', () => {
  const codeBlock = (code: string) => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="ph code-toolbar">
        <div class="ph tools">
          <span class="ph language">css</span>
          <button type="button" class="ph copy">copy</button>
          <span class="ph copy-status" role="status"></span>
        </div>
        <pre><code>${code}</code></pre>
      </div>`
    );

    const toolbar = document.querySelector('.ph.code-toolbar:last-child')!;

    return {
      button: toolbar.querySelector<HTMLButtonElement>('.ph.copy')!,
      status: toolbar.querySelector('.ph.copy-status')!
    };
  };
  const stubClipboard = (writeText: (text: string) => Promise<void>) => {
    const fn = mock.fn(writeText);

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: fn },
      configurable: true
    });

    return fn;
  };

  it('copies the code, says so, and reads "copy" again after a while', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });

    try {
      const writeText = stubClipboard(async () => {});
      const { button, status } = codeBlock(':root{--color-1:#003f5c}');

      assert.equal(await copyCode(button), true);
      assert.deepEqual(writeText.mock.calls[0].arguments, [
        ':root{--color-1:#003f5c}'
      ]);
      assert.equal(button.textContent, 'copied');
      assert.equal(status.textContent, 'css code copied');

      mock.timers.tick(2000);
      assert.equal(button.textContent, 'copy');
      assert.equal(status.textContent, '');
    } finally {
      mock.timers.reset();
    }
  });

  it('says so when the clipboard refuses', async () => {
    stubClipboard(async () => {
      throw new Error('denied');
    });
    mock.method(console, 'error', () => {});

    const { button, status } = codeBlock('x');

    assert.equal(await copyCode(button), false);
    assert.equal(button.textContent, 'copy failed');
    assert.equal(status.textContent, 'Could not copy the css code');
  });

  it('is what a click on a copy button does', async () => {
    const writeText = stubClipboard(async () => {});
    const { button } = codeBlock('clicked');

    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepEqual(writeText.mock.calls[0].arguments, ['clicked']);
  });
});
