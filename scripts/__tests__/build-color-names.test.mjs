import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { colornames } from 'color-name-list';
import fc from 'fast-check';

import { toColorNameMap } from '../build-color-names.mjs';

describe('toColorNameMap', () => {
  it('maps names to lowercase hex', () => {
    assert.deepEqual(
      {
        ...toColorNameMap([
          { name: 'Orange', hex: '#FF9900' },
          { name: 'Deep Sea', hex: '#003f5c' },
        ]),
      },
      { Orange: '#ff9900', 'Deep Sea': '#003f5c' }
    );
  });

  it('keeps Object.prototype names as plain keys', () => {
    const map = toColorNameMap([
      { name: '__proto__', hex: '#000000' },
      { name: 'constructor', hex: '#ffffff' },
    ]);

    assert.equal(Object.getPrototypeOf(map), null);
    assert.deepEqual(Object.keys(map), ['__proto__', 'constructor']);
  });

  it('rejects data that is not an array of { name, hex }', () => {
    for (const data of [
      null,
      {},
      'x',
      [{ name: 'A' }],
      [{ name: 'A', hex: 'red' }],
      [{ name: '', hex: '#000000' }],
      [{ name: 'A', hex: '#fff' }],
    ]) {
      assert.throws(
        () => toColorNameMap(data),
        TypeError,
        JSON.stringify(data)
      );
    }
  });

  it('rejects duplicate names and empty data', () => {
    assert.throws(
      () =>
        toColorNameMap([
          { name: 'A', hex: '#000000' },
          { name: 'A', hex: '#ffffff' },
        ]),
      RangeError
    );
    assert.throws(() => toColorNameMap([]), RangeError);
  });

  it('keeps every entry of any list with unique names', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.record({
            name: fc.string({ minLength: 1 }),
            hex: fc.stringMatching(/^#[0-9a-fA-F]{6}$/),
          }),
          { selector: (entry) => entry.name, minLength: 1 }
        ),
        (entries) => {
          const map = toColorNameMap(entries);

          assert.equal(Object.keys(map).length, entries.length);

          for (const { name, hex } of entries) {
            assert.equal(map[name], hex.toLowerCase());
          }
        }
      )
    );
  });

  it('converts the installed color-name-list without errors', () => {
    assert.equal(
      Object.keys(toColorNameMap(colornames)).length,
      colornames.length
    );
  });
});
