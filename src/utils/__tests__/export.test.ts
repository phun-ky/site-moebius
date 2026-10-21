import 'global-jsdom/register';
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { css } from '../export/css';
import { js } from '../export/js';
import { generateAccentGradientCssVariables } from '../generate-accent-gradients-css-variables';
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

describe('generateAccentGradientCssVariables', () => {
  it('sets one custom property per accent group', () => {
    generateAccentGradientCssVariables({
      interpolate: [['#000000', '#ffffff']]
    } as never);

    assert.equal(
      document.documentElement.style.getPropertyValue(
        '--moebius-accent-interpolate-gradient-1'
      ),
      'linear-gradient(0deg, rgb(0,0,0) 33%,rgb(255,255,255) 66%)'
    );
  });
});
