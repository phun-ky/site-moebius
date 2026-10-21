// Check by keyboard what axe can't (#36): a skip link, one <h1>, swatches
// and dialogs that work with Enter and Escape, arrow keys between tabs, and
// no motion for visitors who ask for less. Run after `npm run build`, or pass
// a built site's directory. Uses the installed Google Chrome; set
// CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from './lib/serve.mjs';

const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));
const focused = (page) =>
  page.evaluate(() => {
    const element = document.activeElement;

    return element?.id || element?.className || element?.tagName;
  });
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
  const test = async (name, run, options = {}) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...options
    });

    try {
      const page = await context.newPage();

      await page.goto(url);
      await page.waitForSelector('[data-color-name]', {
        state: 'attached',
        timeout: 30_000
      });
      await page.waitForFunction(
        () => !document.querySelector('.ph.loading.is-loading')
      );
      results.push([name, await run(page, context)]);
    } catch (error) {
      results.push([name, error.message.split('\n')[0]]);
    } finally {
      await context.close();
    }
  };

  try {
    await test('the first Tab reaches a visible skip link', async (page) => {
      await page.keyboard.press('Tab');

      const skip = await page.evaluate(() => {
        const element = document.activeElement;

        return {
          isSkip: element?.classList.contains('skip-link'),
          left: element?.getBoundingClientRect().left
        };
      });

      return skip.isSkip && skip.left >= 0
        ? null
        : `focus is on ${await focused(page)}`;
    });

    await test('the skip link moves focus to the content', async (page) => {
      const hash = await page.evaluate(() => location.hash);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      const now = await page.evaluate(() => location.hash);

      if ((await focused(page)) !== 'content')
        return `focus is on ${await focused(page)}`;

      return now === hash ? null : `the URL hash changed to ${now}`;
    });

    await test('the start page has one h1', async (page) => {
      const count = await page.evaluate(
        () => document.querySelectorAll('h1').length
      );

      return count === 1 ? null : `${count} h1 elements`;
    });

    await test('Enter on a swatch copies it and makes it the primary color', async (page, context) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const swatch = page.locator('.ph.swatch .ph.color').nth(2);
      const hex = await swatch.getAttribute('data-color-hex');

      await swatch.focus();
      await page.keyboard.press('Enter');
      // The hash is empty until the handler has run, so parsing can fail
      await page.waitForFunction((expected) => {
        try {
          return (
            JSON.parse(atob(location.hash.replace('#options=', '')))
              .baseColor === expected
          );
        } catch {
          return false;
        }
      }, hex);

      const copied = await page.evaluate(() => navigator.clipboard.readText());

      return copied === hex ? null : `copied ${copied}, not ${hex}`;
    });

    await test('arrow keys, Home and End move between tabs', async (page) => {
      const selected = () =>
        page.evaluate(
          () => document.querySelector('[role="tab"][aria-selected="true"]')?.id
        );

      await page.focus('#tab-interpolate');
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(() =>
        document
          .querySelector('#tab-luminanceShift')
          ?.matches('[aria-selected="true"]')
      );

      if ((await focused(page)) !== 'tab-luminanceShift')
        return `focus is on ${await focused(page)} after ArrowRight`;

      await page.keyboard.press('End');
      await page.waitForTimeout(300);

      const last = await selected();

      await page.keyboard.press('Home');
      await page.waitForTimeout(300);

      return last === 'tab-analogous' &&
        (await selected()) === 'tab-interpolate'
        ? null
        : `End selected ${last}, Home selected ${await selected()}`;
    });

    await test('Enter opens the colour picker, Escape closes it', async (page) => {
      await page.focus('#color-picker-input-primary-color');
      await page.keyboard.press('Enter');

      const open = await page.evaluate(
        () => document.querySelector('#color-picker-modal-primary')?.open
      );
      const inside = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('#color-picker-modal-primary'))
      );

      await page.keyboard.press('Escape');

      const closed = await page.evaluate(
        () => !document.querySelector('#color-picker-modal-primary')?.open
      );
      const back = await focused(page);

      if (!open || !inside) return 'the dialog did not open with focus inside';

      return closed && back === 'color-picker-input-primary-color'
        ? null
        : `after Escape: closed ${closed}, focus on ${back}`;
    });

    await test(
      'reduced motion turns off transitions and animations',
      async (page) => {
        const motion = await page.evaluate(() => {
          const swatch = getComputedStyle(
            document.querySelector('.ph.swatch .ph.color')
          );
          const ring = getComputedStyle(document.querySelector('#moebius'));

          return {
            transition: parseFloat(swatch.transitionDuration),
            iterations: ring.animationIterationCount
          };
        });

        return motion.transition < 0.001 && motion.iterations === '1'
          ? null
          : `transition ${motion.transition}s, animation repeats ${motion.iterations}`;
      },
      { reducedMotion: 'reduce' }
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
