import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  NOT_FOUND,
  pageHead,
  parseRoutePaths,
  robots,
  routeFile,
  sitemap,
  withPageHead
} from '../build-routes.mjs';

const config = JSON.parse(
  await readFile(
    new URL('../../src/config/pages.json', import.meta.url),
    'utf8'
  )
);

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

describe('pages.json', () => {
  it('has a page for every route and for the not-found page', async () => {
    const source = await readFile(
      new URL('../../src/lib/spa/router/routes.ts', import.meta.url),
      'utf8'
    );

    for (const path of [...parseRoutePaths(source), NOT_FOUND]) {
      assert.ok(config.pages[path], path);
    }
  });
});

describe('pageHead', () => {
  it('gives a route its title, canonical URL and social card', () => {
    const head = pageHead(config, '/about');

    assert.match(head, /<title>About moebius<\/title>/);
    assert.match(
      head,
      /<link rel="canonical" href="https:\/\/moebius.wtf\/about" \/>/
    );
    assert.match(
      head,
      /og:image" content="https:\/\/moebius.wtf\/img\/social-card.png"/
    );
    assert.doesNotMatch(head, /noindex/);
  });

  it('keeps the not-found page out of search, with no canonical URL', () => {
    const head = pageHead(config, NOT_FOUND);

    assert.match(head, /<meta name="robots" content="noindex" \/>/);
    assert.doesNotMatch(head, /canonical|og:url/);
  });

  it('escapes the text it puts in attributes', () => {
    const head = pageHead(
      {
        ...config,
        pages: { '/x': { title: 'A & B', description: '"<b>"' } }
      },
      '/x'
    );

    assert.match(head, /<title>A &amp; B<\/title>/);
    assert.match(head, /content="&quot;&lt;b&gt;&quot;"/);
  });

  it('throws RangeError for a page pages.json does not have', () => {
    assert.throws(() => pageHead(config, '/nope'), RangeError);
  });
});

describe('withPageHead', () => {
  it('puts the metadata in place of the title', () => {
    const html = withPageHead(
      '<head><title>moebius</title><meta charset="utf-8"></head>',
      config,
      '/'
    );

    assert.equal(html.match(/<title>/g).length, 1);
    assert.match(html, /<title>moebius: color palette/);
  });

  it('throws when there is no title to replace', () => {
    assert.throws(() => withPageHead('<head></head>', config, '/'));
  });
});

describe('sitemap and robots', () => {
  it('lists every page in the sitemap', () => {
    assert.equal(
      sitemap('https://moebius.wtf', ['/', '/about'])
        .match(/<loc>[^<]+/g)
        .join(),
      '<loc>https://moebius.wtf/,<loc>https://moebius.wtf/about'
    );
  });

  it('points robots.txt at the sitemap', () => {
    assert.match(
      robots('https://moebius.wtf'),
      /^Sitemap: https:\/\/moebius.wtf\/sitemap.xml$/m
    );
  });
});
