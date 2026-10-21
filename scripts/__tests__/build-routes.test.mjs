import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import { parseRoutePaths, routeFile } from '../build-routes.mjs';

describe('parseRoutePaths', () => {
  it('reads every path from the real routes.ts', async () => {
    const source = await readFile(
      new URL('../../src/lib/spa/router/routes.ts', import.meta.url),
      'utf8'
    );

    assert.deepEqual(parseRoutePaths(source), ['/', '/about']);
  });

  it('throws RangeError when there are no paths', () => {
    assert.throws(
      () => parseRoutePaths('export const routes = [];'),
      RangeError
    );
  });
});

describe('routeFile', () => {
  it('maps paths to the file GitHub Pages serves them from', () => {
    assert.equal(routeFile('/'), null);
    assert.equal(routeFile('/about'), 'about.html');
    assert.equal(routeFile('/guide/usage'), 'guide/usage.html');
  });

  it('throws TypeError for paths that would escape dist or are not plain', () => {
    for (const path of [
      '',
      'about',
      '/../x',
      '/a/../b',
      '/about/',
      '/a b',
      '/a?b',
      '/:id'
    ]) {
      assert.throws(() => routeFile(path), TypeError, path);
    }
  });

  it('only ever returns a relative .html file inside dist', () => {
    fc.assert(
      fc.property(fc.string(), (path) => {
        let file;

        try {
          file = routeFile(path);
        } catch (error) {
          assert.ok(error instanceof TypeError);

          return;
        }

        if (file !== null) {
          assert.match(file, /^[a-z0-9-]+(\/[a-z0-9-]+)*\.html$/);
        }
      })
    );
  });
});
