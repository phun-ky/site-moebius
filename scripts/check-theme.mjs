// Check the theme in headless Chrome against the built site (#65): it follows
// the system setting until the visitor picks one, it is set before the first
// paint, a saved choice survives a reload, and one click on the theme button
// toggles exactly once, however often the page has re-rendered. Run after
// `npm run build`, or pass a built site's directory. Uses the installed
// Google Chrome; set CHROME_PATH to use another binary.
import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

import { serve } from './lib/serve.mjs';

const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));

const isLight = (page) =>
  page.evaluate(() =>
    document.documentElement.classList.contains('theme--light')
  );

const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const server = await serve(DIST);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const results = [];
  const test = async (name, colorScheme, run) => {
    const context = await browser.newContext({ colorScheme });

    try {
      const page = await context.newPage();

      // Record the theme when the HTML has been parsed, before the app runs
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          window.__themeAtFirstPaint =
            document.documentElement.classList.contains('theme--light')
              ? 'light'
              : 'dark';
        });
      });
      await page.goto(url);
      await page.waitForSelector('[data-color-name]', {
        state: 'attached',
        timeout: 30_000,
      });
      await page.waitForFunction(
        () => !document.querySelector('.ph.loading.is-loading')
      );

      const problem = await run(page);

      results.push([name, problem]);
    } catch (error) {
      results.push([name, error.message.split('\n')[0]]);
    } finally {
      await context.close();
    }
  };

  try {
    await test(
      'system light, nothing saved: light before the first paint',
      'light',
      async (page) => {
        const early = await page.evaluate(() => window.__themeAtFirstPaint);

        return early === 'light' && (await isLight(page))
          ? null
          : `got ${early} at first paint`;
      }
    );

    await test('system dark, nothing saved: dark', 'dark', async (page) =>
      (await isLight(page)) ? 'got light' : null
    );

    await test('a saved choice survives a reload', 'dark', async (page) => {
      await page.click('.ph.darkmode-button');
      await page.reload();
      await page.waitForSelector('[data-color-name]', { state: 'attached' });

      const early = await page.evaluate(() => window.__themeAtFirstPaint);

      return early === 'light' && (await isLight(page))
        ? null
        : `got ${early} after reload`;
    });

    await test(
      'one click toggles once after re-renders',
      'dark',
      async (page) => {
        for (const id of [
          'color-scale-lab',
          'color-scale-hsl',
          'color-scale-lch',
        ]) {
          await page.click(`label[for="${id}"]`);
          await page.waitForFunction(
            (mode) => document.querySelector(`#color-scale-${mode}`)?.checked,
            id.replace('color-scale-', '')
          );
        }

        await page.click('.ph.darkmode-button');

        return (await isLight(page)) ? null : 'still dark after one click';
      }
    );

    await test(
      'follows a system change while nothing is saved',
      'dark',
      async (page) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.waitForFunction(
          () => document.documentElement.classList.contains('theme--light'),
          null,
          { timeout: 5_000 }
        );

        return null;
      }
    );
  } finally {
    await browser.close();
    server.close();
  }

  for (const [name, problem] of results) {
    console.log(
      `${problem ? 'FAIL' : 'ok  '} ${name}${problem ? `: ${problem}` : ''}`
    );
  }

  if (results.some(([, problem]) => problem)) process.exitCode = 1;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
