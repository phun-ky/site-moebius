import 'global-jsdom/register';
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { flatten } from '../../../scripts/build-tokens.mjs';
import { css } from '../export/css';
import { js } from '../export/js';
import { colorValue, tokens } from '../export/tokens';
import { getGradientStyle } from '../get-gradient-style';

import { installMoebius } from './helpers/moebius';

before(installMoebius);

describe('css export', () => {
  it('writes the colours as custom properties named after the colours', () => {
    const out = css(['#003f5c', '#ff9900'], [['#ff9900']]);

    assert.match(
      out,
      /^:root\{\n {2}--color-deepSea: #003f5c;\n {2}--color-orange: #ff9900;\n\}/
    );
    assert.match(out, /\.accents-deepSea \{\n {3}--color-orange: #ff9900;\n\}/);
  });

  it('adds inherited properties for an accent type', () => {
    const out = css(['#003f5c'], [], 'luminance shift');

    assert.match(out, /--color-luminanceShift-1: var\(--color-deepSea\);/);
  });
});

describe('js export', () => {
  it('writes the colours as an array with their names', () => {
    const out = js(['#003f5c', '#ff9900'], []);

    assert.match(out, /'#003f5c', \/\/ Deep Sea/);
    assert.match(out, /'#ff9900', \/\/ Orange/);
  });
});

describe('getGradientStyle', () => {
  it('builds a gradient with evenly spaced stops', () => {
    assert.equal(
      getGradientStyle(['#000000', '#ffffff']),
      'background-image: linear-gradient(90deg, rgb(0,0,0) 33%, rgb(255,255,255) 66%);'
    );
  });

  it('returns nothing for one colour and throws for none', () => {
    assert.equal(getGradientStyle(['#000000']), undefined);
    assert.throws(() => getGradientStyle([]), /Missing colors/);
  });
});

describe('design tokens export', () => {
  const colors: `#${string}`[] = ['#003f5c', '#ff9900'];
  const shades: `#${string}`[][] = [
    ['#003f5c', '#000000'],
    ['#ff9900', '#000000']
  ];
  const out = () => JSON.parse(tokens(colors, shades, 'interpolate'));

  it('writes each color as an srgb token with its hex and name', () => {
    assert.deepEqual(out().interpolate['1'], {
      $value: {
        colorSpace: 'srgb',
        components: [0, 0.2471, 0.3608],
        hex: '#003f5c'
      },
      $description: 'Deep Sea'
    });
    assert.equal(out().$type, 'color');
  });

  it('numbers the shades under each color', () => {
    assert.deepEqual(Object.keys(out().interpolate.shades), ['1', '2']);
    assert.equal(out().interpolate.shades['2']['1'].$value.hex, '#ff9900');
  });

  it('follows the format, so the token reader for tokens/ accepts it', () => {
    const flat = flatten(out());

    assert.equal(flat.size, colors.length + shades.flat().length);

    for (const [, token] of flat) assert.equal(token.type, 'color');
  });

  it('has the same colors as the CSS export', () => {
    const hexes = [...flatten(out()).values()].map(
      (token) => (token.value as { hex: string }).hex
    );
    const inCss = [...css(colors, shades).matchAll(/#[0-9a-f]{6}/g)].map(
      ([hex]) => hex
    );

    assert.deepEqual(hexes.sort(), inCss.sort());
  });

  it('rounds the components to four decimals', () => {
    assert.deepEqual(colorValue('#FFFFFF').components, [1, 1, 1]);
    assert.equal(colorValue('#FFFFFF').hex, '#ffffff');
  });
});
