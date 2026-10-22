// Load every page of the built site in headless Chrome at phone, tablet and
// desktop widths, in the dark and light theme, and fail if a page scrolls
// sideways or the viewport isn't the width asked for (#27, #38). Full-page
// screenshots at 390, 768 and 1440 px go to screenshots/, which CI keeps as
// an artifact. Run after `npm run build`, or pass a built site's directory.
// Uses the installed Google Chrome; set CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync, mkdirSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from './lib/serve.mjs';

export const WIDTHS = [320, 360, 390, 425, 768, 1024, 1440];

export const SCREENSHOT_WIDTHS = [390, 768, 1440];

export const THEMES = ['dark', 'light'];

export const PAGES = [
  { name: 'start', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'not-found', path: '/this-page-does-not-exist' }
];

// The built site; pass another directory as the first argument to check it
const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));
const SCREENSHOTS = fileURLToPath(new URL('../screenshots', import.meta.url));
/**
 * Wait until a page is fully rendered: the loading overlay is gone and, on
 * the start page, the colour names have arrived.
 * @param {import('playwright-core').Page} page - The page.
 * @param {string} path - Its path.
 */
const ready = async (page, path) => {
  await page.waitForFunction(
    () =>
      document.querySelector('main') &&
      !document.querySelector('.ph.loading.is-loading'),
    null,
    { timeout: 30_000 }
  );

  if (path === '/') {
    await page.waitForFunction(
      () => document.querySelector('.ph.swatch .ph.color')?.dataset.colorName,
      null,
      { timeout: 30_000 }
    );
  }
};
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/index.html not found: run npm run build first');
  }

  mkdirSync(SCREENSHOTS, { recursive: true });

  const server = await serve(DIST);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const failures = [];

  try {
    for (const { name, path } of PAGES) {
      for (const theme of THEMES) {
        for (const width of WIDTHS) {
          // Below 500 px, emulate a phone: a desktop window can't be that
          // narrow
          const phone = width < 500;
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            isMobile: phone,
            hasTouch: phone,
            // The site follows the system setting while no theme is saved
            colorScheme: theme,
            // No transitions half-way through a screenshot
            reducedMotion: 'reduce'
          });

          try {
            const page = await context.newPage();

            await page.goto(`${origin}${path}`);
            await ready(page, path);

            const light = await page.evaluate(() =>
              document.documentElement.classList.contains('theme--light')
            );

            if (light !== (theme === 'light')) {
              throw new Error(`Expected the ${theme} theme on ${path}`);
            }

            const { clientWidth, scrollWidth } = await page.evaluate(() => ({
              clientWidth: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth
            }));
            const ok = clientWidth === width && scrollWidth <= clientWidth;

            console.log(
              `${ok ? 'ok  ' : 'FAIL'} ${path} ${theme} ${width} px: page ${scrollWidth} px wide, viewport ${clientWidth} px`
            );

            if (!ok) failures.push(`${path} ${theme} ${width}`);

            if (SCREENSHOT_WIDTHS.includes(width)) {
              await page.screenshot({
                path: join(SCREENSHOTS, `${name}-${width}-${theme}.png`),
                fullPage: true
              });
            }
          } finally {
            await context.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error(`Horizontal scroll at: ${failures.join(', ')}`);
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
