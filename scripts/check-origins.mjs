// Load every page of the built site in headless Chrome and fail if it
// requests anything from another host (#34): no CDNs, fonts, analytics or
// embeds. Links to other sites are fine; only requests count. Run after
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
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const paths = [
    ...parseRoutePaths(readFileSync(ROUTES, 'utf8')),
    '/this-page-does-not-exist'
  ];
  const server = await serve(DIST);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const external = new Set();

  try {
    for (const path of paths) {
      const page = await browser.newPage();

      page.on('request', (request) => {
        const url = new URL(request.url());

        if (['data:', 'blob:'].includes(url.protocol) || url.origin === origin)
          return;

        external.add(`${path} requested ${url.href}`);
      });

      try {
        await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
        console.log(`ok   ${path}: loaded`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const entry of external) {
    console.error(`FAIL ${entry}`);
  }

  if (external.size > 0) process.exitCode = 1;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
