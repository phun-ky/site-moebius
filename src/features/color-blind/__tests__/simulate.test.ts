import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import { colorBlindCheck } from '../color-blind-check';
import { SIMULATIONS, simulate } from '../simulate';

// Computed with a separate implementation (Python) of the same model and
// matrices, so a slip in the TypeScript port shows up here
const EXPECTED: Record<string, Record<string, string>> = {
  protanopia: {
    '#ff0000': '#6d5f00',
    '#00ff00': '#ffe500',
    '#0000ff': '#0059ff',
    '#003f5c': '#313f5d',
    '#ff9900': '#b9a300',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  protanomaly: {
    '#ff0000': '#a75900',
    '#00ff00': '#e3eb00',
    '#0000ff': '#004bff',
    '#003f5c': '#293e5d',
    '#ff9900': '#d0a300',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  deuteranopia: {
    '#ff0000': '#a39000',
    '#00ff00': '#efd63a',
    '#0000ff': '#003dfb',
    '#003f5c': '#25375c',
    '#ff9900': '#d2bb06',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  deuteranomaly: {
    '#ff0000': '#bb7d00',
    '#00ff00': '#d6e131',
    '#0000ff': '#0038fd',
    '#003f5c': '#213a5c',
    '#ff9900': '#dcb200',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  tritanopia: {
    '#ff0000': '#ff000f',
    '#00ff00': '#00f7d9',
    '#0000ff': '#006b96',
    '#003f5c': '#004649',
    '#ff9900': '#ff8182',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  tritanomaly: {
    '#ff0000': '#ff0004',
    '#00ff00': '#00fc99',
    '#0000ff': '#0046d7',
    '#003f5c': '#004254',
    '#ff9900': '#ff905a',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  achromatopsia: {
    '#ff0000': '#7f7f7f',
    '#00ff00': '#dcdcdc',
    '#0000ff': '#4c4c4c',
    '#003f5c': '#3b3b3b',
    '#ff9900': '#b1b1b1',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
  achromatomaly: {
    '#ff0000': '#c06464',
    '#00ff00': '#afebaf',
    '#0000ff': '#3b3bb2',
    '#003f5c': '#2d3c4a',
    '#ff9900': '#d5a88c',
    '#ffffff': '#ffffff',
    '#000000': '#000000',
    '#808080': '#808080',
  },
};

const hex = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map((rgb) => `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`);

describe('simulate', () => {
  it('matches the reference values for every type', () => {
    for (const [type, colors] of Object.entries(EXPECTED)) {
      for (const [color, expected] of Object.entries(colors)) {
        assert.equal(simulate(color, type), expected, `${type} ${color}`);
      }
    }
  });

  it('covers exactly the eight simulation types', () => {
    assert.deepEqual(
      [...SIMULATIONS.keys()].sort(),
      Object.keys(EXPECTED).sort()
    );
  });

  it('leaves colours unchanged for normal vision and unknown types', () => {
    fc.assert(
      fc.property(
        hex,
        fc.constantFrom('normal', '__proto__', 'constructor', 'x'),
        (color, type) => {
          assert.equal(simulate(color, type), color);
        }
      )
    );
  });

  it('keeps black, white and greys as they are', () => {
    for (const type of SIMULATIONS.keys()) {
      for (const grey of ['#000000', '#808080', '#ffffff']) {
        assert.equal(simulate(grey, type), grey, `${type} ${grey}`);
      }
    }
  });

  it('turns every colour grey with achromatopsia', () => {
    fc.assert(
      fc.property(hex, (color) => {
        const [r, g, b] = simulate(color, 'achromatopsia').match(
          /[0-9a-f]{2}/g
        )!;

        assert.ok(r === g && g === b, color);
      })
    );
  });

  it('always returns a hex colour', () => {
    fc.assert(
      fc.property(
        hex,
        fc.constantFrom(...SIMULATIONS.keys()),
        (color, type) => {
          assert.match(simulate(color, type), /^#[0-9a-f]{6}$/);
        }
      )
    );
  });
});

describe('colorBlindCheck', () => {
  it('flags a red and green that deuteranopes confuse', () => {
    // matplotlib's default red and green, a well-known problem pair
    assert.ok(colorBlindCheck(['#d62728', '#2ca02c']).includes('deuteranopia'));
  });

  it('accepts black and white for every type', () => {
    assert.deepEqual(colorBlindCheck(['#000000', '#ffffff']), []);
  });
});
