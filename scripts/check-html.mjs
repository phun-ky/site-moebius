// Validate the site's HTML with html-validate, using .htmlvalidate.json
// (#39): every HTML file the build writes, and each page as Chrome renders
// it, since most of the markup is made in the browser. Run after
// `npm run build`, or pass a built site's directory. Uses the installed
// Google Chrome; set CHROME_PATH to use another binary.
import {
  FileSystemConfigLoader,
  HtmlValidate,
  formatterFactory
} from 'html-validate';
import { chromium } from 'playwright-core';

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from './check-layout.mjs';
import { serve } from './lib/serve.mjs';

const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
    );
  }

  const validator = new HtmlValidate(new FileSystemConfigLoader());
  // Each document to validate, by the name it's reported under
  const documents = new Map(
    readdirSync(DIST)
      .filter((file) => file.endsWith('.html'))
      .map((file) => [`dist/${file}`, readFileSync(join(DIST, file), 'utf8')])
  );
  const server = await serve(DIST);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );

  try {
    for (const { name, path } of PAGES) {
      const page = await browser.newPage();

      try {
        await page.goto(`${origin}${path}`);
        await page.waitForFunction(
          () =>
            document.querySelector('main') &&
            !document.querySelector('.ph.loading.is-loading'),
          null,
          { timeout: 30_000 }
        );

        if (path === '/') {
          // The colour names arrive after the first render
          await page.waitForFunction(
            () =>
              document.querySelector('.ph.swatch .ph.color')?.dataset.colorName,
            null,
            { timeout: 30_000 }
          );
        }

        documents.set(
          `rendered ${name} page (${path})`,
          `<!doctype html>\n${await page.evaluate(
            () => document.documentElement.outerHTML
          )}`
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const results = [];

  for (const [name, html] of documents) {
    // The config is looked up from the repo root, not from dist
    const report = await validator.validateString(
      html,
      fileURLToPath(
        new URL(`../${name.replace(/\W+/g, '-')}.html`, import.meta.url)
      )
    );

    console.log(`${report.valid ? 'ok  ' : 'FAIL'} ${name}`);
    results.push(
      ...report.results.map((result) => ({ ...result, filePath: name }))
    );
  }

  if (results.length > 0) {
    console.error(formatterFactory('stylish')(results));
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
