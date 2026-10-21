import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { colorBlindSim } from '../color-blind-sim';
import { simulate } from '../simulate';

describe('colorBlindSim', () => {
  it('simulates with the chosen type', () => {
    assert.equal(
      colorBlindSim('#ff0000', 'deuteranopia'),
      simulate('#ff0000', 'deuteranopia')
    );
  });

  it('returns the colour for normal vision and values from a crafted URL', () => {
    for (const type of ['normal', '__proto__', '"><img src=x>']) {
      assert.equal(colorBlindSim('#FF9900', type), '#ff9900');
    }
  });
});
