// Check the Content Security Policy of the built site (#35). Every HTML file
// must carry the policy, with no 'unsafe-inline' for scripts or <style>
// elements, and no inline scripts, <style> elements, event handler
// attributes or javascript: URLs. Then every page is loaded and the start
// page used in headless Chrome, and any CSP violation fails the check. Run
// after `npm run build`, or pass a built site's directory. Uses the
// installed Google Chrome; set CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

/**
 * Find what breaks the policy in one HTML file.
 * @param {string} html - The file's contents.
 * @returns {string[]} One message per problem.
 */
export const findHtmlProblems = (html) => {
  const problems = [];
  const policy = html.match(
    /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i
  )?.[1];

  if (!policy) {
    problems.push('no Content-Security-Policy meta tag');
  } else {
    const directives = Object.fromEntries(
      policy
        .split(';')
        .map((part) => part.trim().split(/\s+/))
        .filter(([name]) => name)
        .map(([name, ...values]) => [name, values])
    );

    for (const name of ['script-src', 'style-src']) {
      const unsafe = directives[name]?.find((value) =>
        /^'unsafe-(inline|eval)'$/.test(value)
      );

      if (!directives[name]) problems.push(`no ${name}`);
      else if (unsafe) problems.push(`${name} allows ${unsafe}`);
    }
  }

  if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html))
    problems.push('inline <script>');

  if (/<style[\s>]/i.test(html)) problems.push('<style> element');

  if (/\son[a-z]+\s*=/i.test(html)) problems.push('inline event handler');

  if (/javascript:/i.test(html)) problems.push('javascript: URL');

  return problems;
};

const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const failures = [];

  for (const file of readdirSync(DIST).filter((name) =>
    name.endsWith('.html')
  )) {
    for (const problem of findHtmlProblems(
      readFileSync(join(DIST, file), 'utf8')
    )) {
      failures.push(`${file}: ${problem}`);
    }
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

  try {
    for (const path of paths) {
      const page = await browser.newPage();

      await page.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener('securitypolicyviolation', (event) => {
          window.__cspViolations.push(
            `${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`
          );
        });
      });
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });

      if (path === '/') {
        // Use the page the way a visitor would, so code that only runs on
        // interaction is checked too
        await page.waitForSelector('[data-color-name]', { state: 'attached' });
        await page.waitForFunction(
          () => !document.querySelector('.ph.loading.is-loading')
        );

        const settle = () => page.waitForTimeout(400);

        await page
          .locator('[role="tabpanel"]:not([hidden]) summary')
          .first()
          .click();
        await settle();
        await page.locator('[role="tab"]').nth(1).click();
        await settle();
        await page.click('label[for="color-scale-lab"]');
        await settle();
        await page.selectOption('#color-blind-sim', 'deuteranopia');
        await settle();
        await page.click('.ph.darkmode-button');
        await page.waitForTimeout(500);
      }

      const violations = await page.evaluate(() => window.__cspViolations);

      for (const violation of violations)
        failures.push(`${path}: ${violation}`);
      console.log(
        `${violations.length ? 'FAIL' : 'ok  '} ${path}: ${violations.length} CSP violations`
      );
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const failure of [...new Set(failures)])
    console.error(`FAIL ${failure}`);

  if (failures.length > 0) process.exitCode = 1;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
