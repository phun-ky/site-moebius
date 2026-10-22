import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import globalJsdom from 'global-jsdom';

import { installMoebius } from '../../utils/__tests__/helpers/moebius';

globalJsdom('<!doctype html><html><body></body></html>', {
  url: 'https://moebius.wtf/'
});

const { fillExportCode, setCurrentPalettes } = await import('../export-code');

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
