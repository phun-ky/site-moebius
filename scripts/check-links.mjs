// Check every link on the built site and in the repo's Markdown (#39). Each
// page is rendered in headless Chrome, and every link, script, stylesheet,
// icon and URL in a <meta> tag on it must answer 200, and so must the icons
// in the web app manifest and the pages in robots.txt and sitemap.xml (they
// list the site's own address, which is checked against the build). A
// link to `#id` needs
// an element with that id. Relative links in the Markdown files must point
// at a file in the repo, and `#heading` links at a heading in the file.
//
// Links to other hosts are only fetched with `--external` (the weekly
// workflow), so a site that is down doesn't fail a pull request. Run after
// `npm run build`, or pass a built site's directory. Uses the installed
// Google Chrome; set CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from './check-layout.mjs';
import { serve } from './lib/serve.mjs';

// The site's own address: links to it are checked against the build
export const SITE = 'https://moebius.wtf';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const EXTERNAL = args.includes('--external');
const dir = args.find((arg) => !arg.startsWith('--'));
const DIST = dir ? normalize(dir) : join(ROOT, 'dist');

/**
 * The id GitHub gives a Markdown heading.
 * @param {string} heading - The heading's text.
 * @returns {string} The id.
 */
export const slug = (heading) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');

/**
 * Check the relative links in a Markdown file, and list its links to other
 * hosts.
 * @param {string} file - The file's path, relative to the repo.
 * @param {string} text - Its contents.
 * @param {(path: string) => boolean} exists - Whether a repo path exists.
 * @returns {{ broken: string[], external: string[] }} A message for each
 * broken link, and the http and https links.
 */
export const markdownLinks = (file, text, exists) => {
  const headings = new Set(
    [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => slug(heading))
  );
  const broken = [];
  const external = [];

  for (const [, target] of text.matchAll(/\]\(\s*<?([^)\s>]+)>?[^)]*\)/g)) {
    if (/^https?:/i.test(target)) external.push(target);

    if (/^[a-z][a-z\d+.-]*:/i.test(target)) continue;

    const [path, hash] = target.split('#');

    if (path === '') {
      if (!headings.has(hash)) broken.push(`${file}: no heading for #${hash}`);
    } else if (!exists(normalize(join(dirname(file), decodeURI(path))))) {
      broken.push(`${file}: ${target} does not exist`);
    }
  }

  return { broken, external };
};

/**
 * Wait until a page is fully rendered.
 * @param {import('playwright-core').Page} page - The page.
 */
const ready = (page) =>
  page.waitForFunction(
    () =>
      document.querySelector('main') &&
      !document.querySelector('.ph.loading.is-loading'),
    null,
    { timeout: 30_000 }
  );
/**
 * Collect the URLs a rendered page links to, and the `#id` links whose id
 * is missing.
 * @param {import('playwright-core').Page} page - The page.
 * @returns {Promise<{ urls: string[], missing: string[] }>} What it found.
 */
const collect = (page) =>
  page.evaluate(() => {
    const urls = [
      // `#id` links are checked below, as ids on this page
      ...[
        ...document.querySelectorAll('a[href]:not([href^="#"]), link[href]')
      ].map((element) => element.href),
      ...[...document.querySelectorAll('script[src], img[src]')].map(
        (element) => element.src
      ),
      ...[...document.querySelectorAll('meta[content]')]
        .map((meta) => meta.content)
        .filter((content) => /^(\/|https?:)/.test(content))
        .map((content) => new URL(content, location.href).href)
    ];
    const missing = [...document.querySelectorAll('a[href^="#"]')]
      .map((link) => link.getAttribute('href').slice(1))
      // The start page keeps its settings in `#options=`
      .filter((id) => id && !id.startsWith('options='))
      .filter((id) => !document.getElementById(decodeURIComponent(id)));

    return { urls, missing };
  });
/**
 * The URLs a manifest, sitemap.xml or robots.txt points at.
 * @param {string} url - Its URL.
 * @param {string} text - Its contents.
 * @returns {string[]} The URLs.
 */
const linkedFrom = (url, text) => {
  if (url.endsWith('.webmanifest')) {
    return (JSON.parse(text).icons ?? []).map(
      (icon) => new URL(icon.src, url).href
    );
  }

  if (url.endsWith('/sitemap.xml')) {
    return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
  }

  if (url.endsWith('/robots.txt')) {
    return [...text.matchAll(/^Sitemap:\s*(\S+)/gim)].map(([, map]) => map);
  }

  return [];
};
/**
 * Fetch a URL and return its status, or the error if it could not be read.
 * @param {string} url - The URL.
 * @returns {Promise<{ status: number | string, text: string }>} The result.
 */
const check = async (url) => {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: { 'user-agent': 'moebius.wtf link check' }
    });

    return { status: response.status, text: await response.text() };
  } catch (error) {
    return { status: error.cause?.code ?? error.name, text: '' };
  }
};
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const tracked = new Set(
    execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
  );
  const exists = (path) =>
    tracked.has(path) ||
    [...tracked].some((file) => file.startsWith(`${path}/`));
  const failures = [];
  const markdown = [...tracked]
    .filter((path) => path.endsWith('.md'))
    .map((file) => ({
      file,
      ...markdownLinks(file, readFileSync(join(ROOT, file), 'utf8'), exists)
    }));

  markdown.forEach(({ broken }) => failures.push(...broken));

  const server = await serve(DIST);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  // Every URL found, and the pages it was found on
  const found = new Map();
  const add = (url, from) => {
    const parsed = new URL(url);
    const local =
      parsed.origin === SITE
        ? new URL(`${parsed.pathname}${parsed.search}`, origin)
        : parsed;

    local.hash = '';
    found.set(local.href, [...(found.get(local.href) ?? []), from]);
  };

  markdown.forEach(({ file, external }) =>
    external.forEach((url) => add(url, file))
  );

  add(`${origin}/robots.txt`, 'the site root');

  try {
    for (const { path } of PAGES) {
      const page = await browser.newPage();

      try {
        await page.goto(`${origin}${path}`);
        await ready(page);

        const { urls, missing } = await collect(page);

        urls.forEach((url) => add(url, path));
        missing.forEach((id) =>
          failures.push(`${path}: no element for #${id}`)
        );
      } finally {
        await page.close();
      }
    }

    const checked = new Set();

    let skipped = 0;

    while (checked.size < found.size) {
      for (const url of [...found.keys()].filter((key) => !checked.has(key))) {
        checked.add(url);

        if (!url.startsWith(origin) && !EXTERNAL) {
          skipped++;
          continue;
        }

        const { status, text } = await check(url);
        const ok = status === 200;

        console.log(`${ok ? 'ok  ' : 'FAIL'} ${status} ${url}`);

        if (!ok) {
          failures.push(`${status} ${url} (on ${found.get(url).join(', ')})`);
        } else if (url.startsWith(origin)) {
          linkedFrom(url, text).forEach((link) => add(link, url));
        }
      }
    }

    if (skipped > 0) {
      console.log(
        `Skipped ${skipped} links to other hosts; run with --external to check them`
      );
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error(`Broken links:\n  ${failures.join('\n  ')}`);
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
