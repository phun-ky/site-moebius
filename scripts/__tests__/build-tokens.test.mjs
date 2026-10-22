import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  checkReferences,
  cssValue,
  flatten,
  propertyName,
  readTokens,
  tokensToCss
} from '../build-tokens.mjs';

const tokens = await readTokens();

describe('the tokens in tokens/', () => {
  it('have the same paths in every theme', () => {
    const [dark, ...others] = Object.values(tokens.themes).map((theme) =>
      [...theme.keys()].sort()
    );

    for (const other of others) assert.deepEqual(other, dark);
  });

  it('give each theme token one value per theme, apart from the base', () => {
    for (const theme of Object.values(tokens.themes)) {
      for (const path of theme.keys()) {
        assert.ok(!tokens.base.has(path), `${path} is in the base and a theme`);
      }
    }
  });

  it('have hex values that match their srgb components', () => {
    for (const [path, { type, value }] of [
      ...tokens.base,
      ...Object.values(tokens.themes).flatMap((theme) => [...theme])
    ]) {
      if (type !== 'color' || typeof value === 'string') continue;

      const hex = [1, 3, 5].map((i) => parseInt(value.hex.slice(i, i + 2), 16));

      value.components.forEach((component, i) =>
        assert.ok(Math.abs(component * 255 - hex[i]) < 0.5, path)
      );
    }
  });

  it('become CSS for :root and the light theme', () => {
    const css = tokensToCss(tokens);

    assert.match(
      css,
      /^:root \{\n {2}--moebius-color-link: var\(--moebius-color-brand\);/m
    );
    assert.match(css, /--moebius-space-4: 1rem;/);
    assert.match(
      css,
      /^:root\.theme--light \{\n {2}--moebius-color-brand: #0750b6;/m
    );
  });
});

describe('flatten', () => {
  it('gives each token its path and the type of its closest group', () => {
    const flat = flatten({
      space: { $type: 'dimension', 2: { $value: { value: 0.5, unit: 'rem' } } },
      weight: { bold: { $type: 'fontWeight', $value: 700 } }
    });

    assert.deepEqual(
      [...flat],
      [
        ['space.2', { type: 'dimension', value: { value: 0.5, unit: 'rem' } }],
        ['weight.bold', { type: 'fontWeight', value: 700 }]
      ]
    );
  });

  it('rejects names the format does not allow', () => {
    for (const name of ['a.b', 'a{b', 'a}b']) {
      assert.throws(
        () => flatten({ $type: 'number', [name]: { $value: 1 } }),
        SyntaxError
      );
    }
  });

  it('rejects a token without a type', () => {
    assert.throws(() => flatten({ x: { $value: 1 } }), TypeError);
  });
});

describe('cssValue', () => {
  it('writes colours as hex, or rgb() with alpha', () => {
    const color = { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000' };

    assert.equal(cssValue({ type: 'color', value: color }), '#000000');
    assert.equal(
      cssValue({ type: 'color', value: { ...color, alpha: 0.55 } }),
      'rgb(0 0 0 / 0.55)'
    );
  });

  it('writes references as var()', () => {
    assert.equal(
      cssValue({ type: 'color', value: '{color.brand}' }),
      'var(--moebius-color-brand)'
    );
  });

  it('writes dimensions, font families and shadows', () => {
    assert.equal(
      cssValue({ type: 'dimension', value: { value: 1.5, unit: 'rem' } }),
      '1.5rem'
    );
    assert.equal(
      cssValue({ type: 'fontFamily', value: ['Segoe UI', 'sans-serif'] }),
      `'Segoe UI', sans-serif`
    );
    assert.equal(
      cssValue({
        type: 'shadow',
        value: {
          color: {
            colorSpace: 'srgb',
            components: [0, 0, 0],
            alpha: 0.2,
            hex: '#000000'
          },
          offsetX: { value: 0, unit: 'px' },
          offsetY: { value: 8, unit: 'px' },
          blur: { value: 10, unit: 'px' },
          spread: { value: -5, unit: 'px' },
          inset: true
        }
      }),
      'inset 0px 8px 10px -5px rgb(0 0 0 / 0.2)'
    );
  });

  it('rejects values the site cannot write as CSS', () => {
    assert.throws(
      () => cssValue({ type: 'dimension', value: { value: 1, unit: 'em' } }),
      TypeError
    );
    assert.throws(
      () =>
        cssValue({
          type: 'color',
          value: { colorSpace: 'oklch', components: [0.5, 0.1, 200] }
        }),
      TypeError
    );
  });
});

describe('checkReferences and propertyName', () => {
  it('rejects a reference to a token that does not exist', () => {
    assert.throws(
      () =>
        checkReferences(
          new Map([['a', { type: 'color', value: '{color.nope}' }]])
        ),
      ReferenceError
    );
  });

  it('joins the path with hyphens after the prefix', () => {
    assert.equal(
      propertyName('color.text-strong'),
      '--moebius-color-text-strong'
    );
  });
});
