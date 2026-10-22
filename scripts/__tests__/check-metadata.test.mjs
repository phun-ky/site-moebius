import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { JSDOM } from 'jsdom';

import { NOT_FOUND, withPageHead } from '../build-routes.mjs';
import { checkHead, pngSize } from '../check-metadata.mjs';

const config = JSON.parse(
  await readFile(
    new URL('../../src/config/pages.json', import.meta.url),
    'utf8'
  )
);
const INDEX = '<!doctype html><html><head><title>moebius</title></head></html>';
const parse = (html) => new JSDOM(html).window.document;

describe('checkHead', () => {
  it('accepts the head the build writes', () => {
    for (const path of Object.keys(config.pages)) {
      assert.deepEqual(
        checkHead(parse(withPageHead(INDEX, config, path)), config, path),
        [],
        path
      );
    }
  });

  it('finds a missing description, a wrong canonical and old tags', () => {
    const html = withPageHead(INDEX, config, '/about')
      .replace(/<meta name="description"[^>]*>/, '')
      .replace('https://moebius.wtf/about" />', 'https://moebius.wtf/" />')
      .replace(
        '</head>',
        '<meta name="msapplication-config" content="x"></head>'
      );
    const problems = checkHead(parse(html), config, '/about').join('\n');

    assert.match(problems, /meta\[name="description"\] is 0/);
    assert.match(problems, /canonical is "https:\/\/moebius.wtf\/"/);
    assert.match(problems, /msapplication.* is still there/);
  });

  it('wants noindex and no canonical on the not-found page', () => {
    const html = withPageHead(INDEX, config, '/').replace(
      '<title>moebius: color palette generator and color blind simulator</title>',
      `<title>${config.pages[NOT_FOUND].title}</title>`
    );

    assert.match(
      checkHead(parse(html), config, NOT_FOUND).join('\n'),
      /robots is undefined[^]*canonical is "https:\/\/moebius.wtf\/"/
    );
  });
});

describe('pngSize', () => {
  it('reads the size of the social card', async () => {
    const png = await readFile(
      new URL('../../public/img/social-card.png', import.meta.url)
    );

    assert.deepEqual(pngSize(png), { width: 1200, height: 630 });
  });

  it('returns null for something that is not a PNG', () => {
    assert.equal(pngSize(Buffer.from('<svg></svg>'.padEnd(32))), null);
  });
});
