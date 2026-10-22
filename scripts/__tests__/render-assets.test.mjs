import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { pngSize } from '../check-metadata.mjs';
import { toIco } from '../render-assets.mjs';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url));

describe('toIco', () => {
  it('writes a header, one entry per image, then the images', () => {
    const a = Buffer.from('first png');
    const b = Buffer.from('second, longer png');
    const ico = toIco([
      { size: 16, png: a },
      { size: 256, png: b }
    ]);

    assert.deepEqual(
      [ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)],
      [0, 1, 2]
    );
    // 256 pixels is written as 0
    assert.deepEqual([ico.readUInt8(6), ico.readUInt8(22)], [16, 0]);
    assert.equal(ico.readUInt32LE(6 + 8), a.length);
    assert.equal(ico.readUInt32LE(6 + 12), 6 + 32);
    assert.equal(ico.readUInt32LE(22 + 12), 6 + 32 + a.length);
    assert.equal(ico.subarray(6 + 32 + a.length).toString(), b.toString());
  });
});

describe('the rendered assets', () => {
  it('serve the mark itself as the favicon', async () => {
    assert.equal(
      (await read('public/favicon.svg')).toString(),
      (await read('src/assets/logo/mark.svg')).toString()
    );
  });

  it('have the sizes the manifest, the head and the README expect', async () => {
    for (const [path, width, height] of [
      ['public/img/meta/apple-touch-icon.png', 180, 180],
      ['public/img/meta/android-chrome-192x192.png', 192, 192],
      ['public/img/meta/android-chrome-512x512.png', 512, 512],
      ['public/img/social-card.png', 1200, 630],
      ['docs/img/banner-dark.png', 1280, 320],
      ['docs/img/banner-light.png', 1280, 320]
    ]) {
      assert.deepEqual(pngSize(await read(path)), { width, height }, path);
    }
  });

  it('put 16, 32 and 48 pixel images in favicon.ico', async () => {
    const ico = await read('public/favicon.ico');

    assert.equal(ico.readUInt16LE(4), 3);
    assert.deepEqual(
      [0, 1, 2].map((i) => ico.readUInt8(6 + 16 * i)),
      [16, 32, 48]
    );
  });
});
