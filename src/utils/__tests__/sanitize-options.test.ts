import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  COLOR_BLIND_SIM_TYPES,
  COLOR_SCALE_MODES,
  MAX_NUMBER_OF_COLORS,
  MIN_NUMBER_OF_COLORS,
  sanitizeOptions
} from '../sanitize-options';

const PAYLOAD = '"><img src=x onerror="alert(1)">';

describe('sanitizeOptions', () => {
  it('keeps valid options', () => {
    const valid = {
      baseColor: '#003f5c',
      secondaryColor: '#F90',
      divergentColor: '#f5f5f5',
      diverging: true,
      bezier: false,
      reverseDirection: true,
      randomOffset: false,
      correctLightness: true,
      noDuplicates: false,
      colorScaleMode: 'lch',
      numberOfColors: 9,
      colorBlindSim: 'tritanopia',
      palette: 'triadic'
    };

    assert.deepEqual(sanitizeOptions(valid), valid);
  });

  it('drops markup in every string option', () => {
    for (const key of [
      'baseColor',
      'secondaryColor',
      'divergentColor',
      'colorScaleMode',
      'colorBlindSim',
      'palette'
    ]) {
      assert.deepEqual(sanitizeOptions({ [key]: PAYLOAD }), {}, key);
    }
  });

  it('drops palettes moebius does not make', () => {
    for (const palette of ['nope', 'constructor', '', 'Interpolate']) {
      assert.deepEqual(sanitizeOptions({ palette }), {}, palette);
    }
  });

  it('drops Object.prototype keys as simulation types', () => {
    for (const colorBlindSim of [
      '__proto__',
      'constructor',
      'toString',
      'hasOwnProperty'
    ]) {
      assert.deepEqual(sanitizeOptions({ colorBlindSim }), {}, colorBlindSim);
    }
  });

  it('ignores inherited and __proto__ keys', () => {
    const inherited = Object.create({ colorScaleMode: 'lab' });
    const proto = JSON.parse('{"__proto__": {"colorScaleMode": "lab"}}');

    assert.deepEqual(sanitizeOptions(inherited), {});
    assert.deepEqual(sanitizeOptions(proto), {});
  });

  it('drops numbers outside the range or not integers', () => {
    for (const numberOfColors of [
      MIN_NUMBER_OF_COLORS - 1,
      MAX_NUMBER_OF_COLORS + 1,
      7.5,
      Number.NaN,
      Infinity,
      '7'
    ]) {
      assert.deepEqual(sanitizeOptions({ numberOfColors }), {});
    }
  });

  it('returns {} for anything that is not a plain object', () => {
    for (const input of [null, undefined, 'x', 1, true, [], [PAYLOAD]]) {
      assert.deepEqual(sanitizeOptions(input), {});
    }
  });

  it('only ever returns known keys with safe values, for any input', () => {
    const SAFE = /^[#0-9a-z]*$/i;

    fc.assert(
      fc.property(
        fc.oneof(
          fc.anything(),
          fc.dictionary(
            fc.constantFrom(
              'baseColor',
              'colorScaleMode',
              'colorBlindSim',
              'numberOfColors',
              'diverging',
              '__proto__',
              'constructor'
            ),
            fc.anything()
          )
        ),
        (input) => {
          const result = sanitizeOptions(input);

          for (const [key, value] of Object.entries(result)) {
            if (typeof value === 'string') {
              assert.match(value, SAFE, key);
            }
          }

          if (result.colorScaleMode !== undefined) {
            assert.ok(COLOR_SCALE_MODES.includes(result.colorScaleMode));
          }

          if (result.colorBlindSim !== undefined) {
            assert.ok(COLOR_BLIND_SIM_TYPES.includes(result.colorBlindSim));
          }

          if (result.numberOfColors !== undefined) {
            assert.ok(Number.isInteger(result.numberOfColors));
          }
        }
      ),
      { numRuns: 2000 }
    );
  });
});
