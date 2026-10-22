// Run axe-core (WCAG 2.0, 2.1 and 2.2, levels A and AA) on every page of the
// built site in headless Chrome, in the dark and light theme, on a phone and
// a desktop, and fail on any violation (#36). Automated checks find only part
// of the problems; keyboard use, focus and reading order still need a person.
// Run after `npm run build`, or pass a built site's directory. Uses the
// installed Google Chrome; set CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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
const AXE = readFileSync(
  createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
  'utf8'
);
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
// Parts of the start page that only show after an interaction
const START_PAGE_STATES = [
  { name: 'as loaded', open: async () => {} },
  {
    name: 'colour picker open',
    open: (page) => page.click('#color-picker-input-primary-color')
  },
  {
    name: 'colour units open',
    open: (page) => page.click('#color-units-primary-button')
  },
  {
    name: 'second palette with its design tokens',
    open: async (page) => {
      await page.click(
        'label.ph.palette-option:has(input[value="luminanceShift"])'
      );
      await page.waitForSelector('.ph.band[data-palette="luminanceShift"]');
      await page.click('#tab-code-tokens');
    }
  }
];
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900 }
];
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
  const violations = new Map();

  try {
    const runs = paths.flatMap((path) =>
      path === '/'
        ? START_PAGE_STATES.map((state) => ({ path, state }))
        : [{ path, state: START_PAGE_STATES[0] }]
    );

    for (const { path, state } of runs) {
      for (const theme of ['dark', 'light']) {
        for (const { name, ...viewport } of VIEWPORTS) {
          // axe is injected as an inline script, which the site's CSP blocks
          const context = await browser.newContext({
            bypassCSP: true,
            colorScheme: theme,
            viewport: { width: viewport.width, height: viewport.height },
            isMobile: viewport.isMobile,
            hasTouch: viewport.hasTouch
          });

          try {
            const page = await context.newPage();

            await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
            await page.waitForFunction(
              () => !document.querySelector('.ph.loading.is-loading')
            );
            await state.open(page);
            await page.waitForTimeout(300);
            // Opening a section can scroll the page; anything then under the
            // pinned palette band counts as an obscured target for axe. Check
            // the page at rest instead; axe still checks every element
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.addScriptTag({ content: AXE });

            const result = await page.evaluate(
              (tags) =>
                window.axe.run(document, {
                  runOnly: { type: 'tag', values: tags }
                }),
              TAGS
            );

            for (const violation of result.violations) {
              const key = `${violation.id} (${violation.impact}): ${violation.help}`;
              const entry = violations.get(key) ?? {
                where: new Set(),
                targets: new Set()
              };

              entry.where.add(`${path} ${state.name} ${theme} ${name}`);

              for (const node of violation.nodes)
                entry.targets.add(node.target.join(' '));

              violations.set(key, entry);
            }

            console.log(
              `${result.violations.length ? 'FAIL' : 'ok  '} ${path} (${state.name}) ${theme} ${name}: ${result.violations.length} rules violated`
            );
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

  for (const [key, { where, targets }] of violations) {
    console.error(`\n${key}`);
    console.error(`  on: ${[...where].join(', ')}`);
    console.error(
      `  ${targets.size} elements, such as: ${[...targets].slice(0, 4).join(' | ')}`
    );
  }

  if (violations.size > 0) process.exitCode = 1;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
