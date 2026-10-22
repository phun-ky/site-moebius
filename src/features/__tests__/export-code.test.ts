import assert from 'node:assert/strict';
import { before, describe, it, mock } from 'node:test';

import globalJsdom from 'global-jsdom';

import { installMoebius } from '../../utils/__tests__/helpers/moebius';

globalJsdom('<!doctype html><html><body></body></html>', {
  url: 'https://moebius.wtf/'
});

const { copyCode, fillExportCode, setCurrentPalettes } =
  await import('../export-code');

const section = (id: string) => {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<details class="ph export-code" data-palette="${id}">
      <summary>Code</summary>
      <code id="${id}-code-css"></code>
      <code id="${id}-code-js"></code>
    </details>`
  );

  return document.querySelector<HTMLDetailsElement>(
    `details[data-palette="${id}"]`
  )!;
};

before(async () => {
  await installMoebius();
  setCurrentPalettes(
    new window.MoebiusPalettes({
      baseColor: new window.MoebiusColor('#003f5c'),
      secondaryColor: new window.MoebiusColor('#ff9900'),
      divergentColor: '#f5f5f5',
      numberOfColors: 5
    })
  );
});

describe('export code', () => {
  it('is empty until its section is opened', () => {
    const details = section('interpolate');

    assert.equal(
      details.querySelector('#interpolate-code-css')?.textContent,
      ''
    );
  });

  it('is filled for the opened palette only, when it opens', async () => {
    const opened = section('complement');
    const other = section('triadic');

    opened.open = true;
    await new Promise((resolve) => opened.addEventListener('toggle', resolve));

    assert.match(
      opened.querySelector('#complement-code-css')?.textContent ?? '',
      /^:root\{\n {2}--color-/
    );
    assert.match(
      opened.querySelector('#complement-code-js')?.textContent ?? '',
      /'#[0-9a-f]{6}'/
    );
    assert.equal(other.querySelector('#triadic-code-css')?.textContent, '');
  });

  it('does nothing without a palette id', () => {
    const details = document.createElement('details');

    assert.doesNotThrow(() => fillExportCode(details));
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
