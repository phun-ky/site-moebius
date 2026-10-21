// Serve the built site the way GitHub Pages does and check every route: `/`
// and each path in routes.ts answer 200 and render their page, and an unknown
// path answers 404 with the site's own not-found page (#28). Run after
// `npm run build`, or pass a built site's directory. Uses the installed
// Google Chrome; set CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRoutePaths } from './build-routes.mjs';
import { serve } from './lib/serve.mjs';

const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));
const ROUTES = fileURLToPath(
  new URL('../src/lib/spa/router/routes.ts', import.meta.url)
);
// What each route must show once the app has rendered it
const EXPECTED = { '/': '[data-color-name]', '/about': 'main h1' };
const UNKNOWN = '/this-page-does-not-exist';
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const paths = parseRoutePaths(readFileSync(ROUTES, 'utf8'));
  const missing = paths.filter((path) => !EXPECTED[path]);

  if (missing.length > 0) {
    throw new Error(
      `Add the new routes to EXPECTED in check-routes.mjs: ${missing.join(
        ', '
      )}`
    );
  }

  const server = await serve(DIST);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const failures = [];
  const check = async (path, status, selector, text) => {
    const page = await browser.newPage();

    try {
      // An error status with an empty body fails the navigation itself
      const response = await page.goto(`${base}${path}`).catch(() => null);
      const actual = response ? response.status() : 'none';
      const element = response
        ? await page
            .waitForSelector(selector, { state: 'attached', timeout: 30_000 })
            .catch(() => null)
        : null;
      const content = element ? await element.textContent() : '';
      // The page must also be usable: the loading overlay gone
      const loaded = element
        ? await page
            .waitForFunction(
              () => !document.querySelector('.ph.loading.is-loading'),
              null,
              { timeout: 10_000 }
            )
            .then(
              () => true,
              () => false
            )
        : false;
      const ok =
        actual === status &&
        element !== null &&
        loaded &&
        (!text || content.includes(text));

      console.log(
        `${ok ? 'ok  ' : 'FAIL'} ${path}: status ${actual} (want ${status}), ${
          element ? `found ${selector}` : `no ${selector}`
        }${element && !loaded ? ', loading overlay still shown' : ''}`
      );

      if (!ok) failures.push(path);
    } finally {
      await page.close();
    }
  };

  try {
    for (const path of paths) {
      await check(path, 200, EXPECTED[path]);
    }

    await check(UNKNOWN, 404, 'main h1', 'Page not found');
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error(`Routes failing: ${failures.join(', ')}`);
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
