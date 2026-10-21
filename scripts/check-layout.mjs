// Load the built site in headless Chrome at phone, tablet and desktop widths,
// in the dark and light theme, and fail if the page scrolls sideways (#27).
// Run after `npm run build`, or pass a built site's directory. Uses the installed Google Chrome; set
// CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from './lib/serve.mjs';

export const WIDTHS = [320, 360, 390, 425, 768, 1024, 1440];

export const THEMES = ['dark', 'light'];

// The built site; pass another directory as the first argument to check it
const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/index.html not found: run npm run build first');
  }

  const server = await serve(DIST);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const failures = [];

  try {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        // Below 500 px, emulate a phone: a desktop window can't be that narrow
        const phone = width < 500;
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          isMobile: phone,
          hasTouch: phone,
          // The site follows the system setting while no theme is saved
          colorScheme: theme
        });

        try {
          const page = await context.newPage();

          await page.goto(url);
          await page.waitForSelector('[data-color-name]', {
            state: 'attached',
            timeout: 30_000
          });

          const light = await page.evaluate(() =>
            document.documentElement.classList.contains('theme--light')
          );

          if (light !== (theme === 'light')) {
            throw new Error(`Expected the ${theme} theme`);
          }

          const { clientWidth, scrollWidth } = await page.evaluate(() => ({
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth
          }));
          const ok = clientWidth === width && scrollWidth <= clientWidth;

          console.log(
            `${ok ? 'ok  ' : 'FAIL'} ${theme.padEnd(5)} ${String(
              width
            ).padStart(
              4
            )} px: page ${scrollWidth} px wide, viewport ${clientWidth} px`
          );

          if (!ok) failures.push(`${theme} ${width}`);
        } finally {
          await context.close();
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
