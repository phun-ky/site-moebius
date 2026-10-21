import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import chroma from 'chroma-js';
import fc from 'fast-check';

import { camelCase } from '../camel-case';
import { cx } from '../cx';
import { getA11yTextColor } from '../get-a11y-text-color';
import { shuffleArray } from '../shuffle-array';
import { uniqueID } from '../unique-id';

describe('camelCase', () => {
  it('turns colour names into identifiers', () => {
    assert.equal(camelCase('Maniac Mansion'), 'maniacMansion');
    assert.equal(camelCase('  The Count’s Black '), 'theCountsBlack');
    assert.equal(camelCase('Crème Brûlée'), 'cremeBrulee');
    assert.equal(camelCase('100 Mph'), '100Mph');
  });

  it('only ever returns letters, digits and dashes', () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        assert.match(camelCase(value), /^[a-zA-Z0-9-]*$/);
      })
    );
  });
});

describe('cx', () => {
  it('joins a base class with the truthy keys of an object', () => {
    assert.equal(
      cx('ph button', { active: true, hidden: false }),
      'ph button active'
    );
    assert.equal(cx({ a: true, b: false, c: true }), 'a c');
    assert.equal(cx(' ph '), 'ph');
    assert.equal(cx(undefined), '');
  });
});

describe('getA11yTextColor', () => {
  it('picks white on dark and black on light backgrounds', () => {
    assert.equal(getA11yTextColor('#003f5c'), '#ffffff');
    assert.equal(getA11yTextColor('#ff9900'), '#000000');
    assert.equal(getA11yTextColor('#ffffff'), '#000000');
  });

  it('picks white for #267e6b, where black falls below 4.5:1', () => {
    assert.equal(getA11yTextColor('#267e6b'), '#ffffff');
  });

  it('always picks the text colour with the higher contrast', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0xffffff }), (n) => {
        const color = `#${n.toString(16).padStart(6, '0')}`;
        const text = getA11yTextColor(color);
        const other = text === '#ffffff' ? '#000000' : '#ffffff';

        assert.ok(
          chroma.contrast(color, text) >= chroma.contrast(color, other)
        );
      })
    );
  });
});

describe('shuffleArray', () => {
  it('returns a new array with the same items', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (items) => {
        const shuffled = shuffleArray(items);

        assert.notEqual(shuffled, items);
        assert.deepEqual([...shuffled].sort(), [...items].sort());
      })
    );
  });
});

describe('uniqueID', () => {
  it('returns ids that start with an underscore and differ', () => {
    const ids = new Set(Array.from({ length: 1000 }, uniqueID));

    assert.equal(ids.size, 1000);

    for (const id of ids) assert.match(id, /^_[a-z0-9]+$/);
  });
});
