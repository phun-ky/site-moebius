// Check each built page's metadata against src/config/pages.json (#40): one
// title, description and social card each, a canonical URL that matches
// og:url, and noindex with no canonical on the not-found page. The social
// card must be a PNG of the size it claims, and sitemap.xml and robots.txt
// must list the pages. In Chrome, the title must follow the page, also after
// moving to another page without a reload. Run after `npm run build`, or
// pass a built site's directory. Uses the installed Google Chrome; set
// CHROME_PATH to use another binary.
import { JSDOM } from 'jsdom';
import { chromium } from 'playwright-core';

import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { NOT_FOUND, parseRoutePaths, routeFile } from './build-routes.mjs';
import { serve } from './lib/serve.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = process.argv[2] ? normalize(process.argv[2]) : join(ROOT, 'dist');
// Tags each page has exactly one of
const ONE_EACH = [
  'title',
  'meta[name="description"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:image"]',
  'meta[property="og:image:alt"]',
  'meta[name="twitter:card"]'
];
// Tags for browsers and services that no longer use them
const GONE = [
  'meta[http-equiv="X-UA-Compatible"]',
  'meta[name^="msapplication"]',
  'link[rel="mask-icon"]',
  'link[rel="shortcut icon"]'
];

/**
 * The width and height in a PNG's header.
 * @param {Buffer} png - The file.
 * @returns {{ width: number, height: number } | null} Its size, or null if
 * it isn't a PNG.
 */
export const pngSize = (png) =>
  png.subarray(1, 4).toString('latin1') === 'PNG' &&
  png.subarray(12, 16).toString('latin1') === 'IHDR'
    ? { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
    : null;

/**
 * Check one built page's head.
 * @param {Document} document - The page.
 * @param {typeof import('../src/config/pages.json')} config - pages.json.
 * @param {string} path - Its path in pages.json.
 * @returns {string[]} What is wrong.
 */
export const checkHead = (document, config, path) => {
  const page = config.pages[path];
  const problems = [];
  const content = (selector) =>
    document.querySelector(selector)?.getAttribute('content');
  const expect = (what, actual, expected) => {
    if (actual !== expected) {
      problems.push(
        `${what} is ${JSON.stringify(actual)}, not ${JSON.stringify(expected)}`
      );
    }
  };

  for (const selector of ONE_EACH) {
    expect(
      `the number of ${selector}`,
      document.querySelectorAll(selector).length,
      1
    );
  }

  for (const selector of GONE) {
    if (document.querySelector(selector))
      problems.push(`${selector} is still there`);
  }

  expect('<title>', document.title, page.title);
  expect('og:title', content('meta[property="og:title"]'), page.title);
  expect('description', content('meta[name="description"]'), page.description);
  expect(
    'og:description',
    content('meta[property="og:description"]'),
    page.description
  );
  expect(
    'og:image',
    content('meta[property="og:image"]'),
    new URL(config.image.path, config.site).href
  );

  const canonical = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute('href');

  if (path === NOT_FOUND) {
    expect('robots', content('meta[name="robots"]'), 'noindex');
    expect('canonical', canonical, undefined);
  } else {
    expect('canonical', canonical, new URL(path, config.site).href);
    expect('og:url', content('meta[property="og:url"]'), canonical);
    expect('robots', content('meta[name="robots"]'), undefined);
  }

  return problems;
};

const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const config = JSON.parse(
    readFileSync(join(ROOT, 'src/config/pages.json'), 'utf8')
  );
  const paths = parseRoutePaths(
    readFileSync(join(ROOT, 'src/lib/spa/router/routes.ts'), 'utf8')
  );
  const failures = [];
  const report = (what, problems) => {
    console.log(`${problems.length === 0 ? 'ok  ' : 'FAIL'} ${what}`);
    failures.push(...problems.map((problem) => `${what}: ${problem}`));
  };

  for (const [path, file] of [
    ...paths.map((path) => [path, routeFile(path) ?? 'index.html']),
    [NOT_FOUND, '404.html']
  ]) {
    const { document } = new JSDOM(readFileSync(join(DIST, file), 'utf8'))
      .window;

    report(`${file} metadata`, checkHead(document, config, path));
  }

  const titles = Object.values(config.pages).map(({ title }) => title);

  report(
    'every page has its own title',
    new Set(titles).size === titles.length ? [] : ['two pages share a title']
  );

  const { image } = config;
  const card = join(DIST, image.path);
  const size = existsSync(card) ? pngSize(readFileSync(card)) : null;

  report(
    `${image.path} is a ${image.width}x${image.height} PNG`,
    size?.width === image.width && size?.height === image.height
      ? []
      : [
          `it is ${size ? `${size.width}x${size.height}` : 'missing or not a PNG'}`
        ]
  );

  const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => loc
  );
  const expected = paths.map((path) => new URL(path, config.site).href);

  report(
    'sitemap.xml lists every page',
    JSON.stringify(listed) === JSON.stringify(expected)
      ? []
      : [`it lists ${listed.join(', ')}`]
  );
  report(
    'robots.txt points at the sitemap',
    readFileSync(join(DIST, 'robots.txt'), 'utf8').includes(
      `Sitemap: ${new URL('/sitemap.xml', config.site).href}`
    )
      ? []
      : ['no Sitemap line']
  );

  const server = await serve(DIST);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );

  try {
    const page = await browser.newPage();
    const title = async () => {
      await page.waitForFunction(
        () =>
          document.querySelector('main') &&
          !document.querySelector('.ph.loading.is-loading'),
        null,
        { timeout: 30_000 }
      );

      return page.title();
    };

    for (const path of [...paths, '/this-page-does-not-exist']) {
      await page.goto(`${origin}${path}`);

      const pagePath = paths.includes(path) ? path : NOT_FOUND;
      const actual = await title();

      report(
        `title in Chrome on ${path}`,
        actual === config.pages[pagePath].title
          ? []
          : [`it is ${JSON.stringify(actual)}`]
      );
    }

    // From the not-found page back to the start page, without a reload
    await page.click('main a[data-link="/"]');
    await page.waitForURL(`${origin}/`);

    const actual = await title();

    report(
      'title in Chrome after moving to / without a reload',
      actual === config.pages['/'].title
        ? []
        : [`it is ${JSON.stringify(actual)}`]
    );
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error(`Metadata problems:\n  ${failures.join('\n  ')}`);
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
