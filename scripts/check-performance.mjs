// Measure the built site on a throttled phone in headless Chrome, as
// Lighthouse's mobile profile does (slow 4G, 4x CPU slowdown), and fail when a
// budget is exceeded (#37): bytes per resource type, LCP, CLS and INP. Each
// page is loaded three times and the median counts. Run after
// `npm run build`, or pass a built site's directory. Uses the installed
// Google Chrome; set CHROME_PATH to use another binary.
import { chromium } from 'playwright-core';

import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from './lib/serve.mjs';

const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));

export const BUDGETS = JSON.parse(
  readFileSync(new URL('../performance-budgets.json', import.meta.url), 'utf8')
);

const RUNS = 3;
// Lighthouse's slow 4G and mid-range phone
const NETWORK = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8
};
const CPU_SLOWDOWN = 4;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)];
};
const TYPE = {
  Script: 'js',
  Stylesheet: 'css',
  Image: 'images',
  Font: 'fonts',
  Fetch: 'data',
  XHR: 'data',
  Document: 'html'
};
const measure = async (browser, url, interact) => {
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark'
  });

  try {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const bytes = {};
    const types = new Map();

    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', NETWORK);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN });
    cdp.on('Network.responseReceived', ({ requestId, type }) =>
      types.set(requestId, TYPE[type] ?? 'other')
    );
    cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
      const type = types.get(requestId) ?? 'other';

      bytes[type] = (bytes[type] ?? 0) + encodedDataLength;
    });
    await page.addInitScript(() => {
      window.__perf = { lcp: 0, lcpElement: '', cls: 0, inp: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const { element } = entry;

          window.__perf.lcp = entry.startTime;
          window.__perf.lcpElement = element
            ? `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`
            : 'text';
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__perf.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (entry.interactionId)
            window.__perf.inp = Math.max(window.__perf.inp, entry.duration);
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForFunction(
      () => !document.querySelector('.ph.loading.is-loading'),
      null,
      { timeout: 120_000 }
    );

    if (interact) await interact(page);

    await page.waitForTimeout(1000);

    const perf = await page.evaluate(() => window.__perf);

    return { ...perf, bytes };
  } finally {
    await context.close();
  }
};
// Change the colour scale, which re-renders every palette: the slowest
// interaction on the page
const changeScale = async (page) => {
  await page.click('label[for="color-scale-lab"]');
  await page.waitForFunction(
    () => document.querySelector('#color-scale-lab')?.checked
  );
};
const main = async () => {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error(
      `${join(DIST, 'index.html')} not found: run npm run build first`
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

  try {
    for (const [path, interact] of [
      ['/', changeScale],
      ['/about', null]
    ]) {
      const runs = [];

      for (let i = 0; i < RUNS; i++)
        runs.push(await measure(browser, `${base}${path}`, interact));

      const result = {
        lcp: median(runs.map((run) => run.lcp)),
        lcpElement: runs[0].lcpElement,
        cls: median(runs.map((run) => run.cls)),
        inp: median(runs.map((run) => run.inp)),
        bytes: Object.fromEntries(
          [...new Set(runs.flatMap((run) => Object.keys(run.bytes)))].map(
            (type) => [type, median(runs.map((run) => run.bytes[type] ?? 0))]
          )
        )
      };
      const budget = BUDGETS[path] ?? {};
      const checks = [
        [`LCP (${result.lcpElement})`, result.lcp, budget.lcpMs, 'ms'],
        ['CLS', result.cls, budget.cls, ''],
        ['INP', result.inp, budget.inpMs, 'ms'],
        ...Object.entries(result.bytes).map(([type, value]) => [
          `${type} bytes`,
          value,
          budget.bytes?.[type],
          ' B'
        ])
      ];

      for (const [name, value, limit, unit] of checks) {
        const over = typeof limit === 'number' && value > limit;
        const shown = unit === '' ? value.toFixed(3) : Math.round(value);

        if (over) failures.push(`${path} ${name}`);

        console.log(
          `${over ? 'FAIL' : 'ok  '} ${path} ${name}: ${shown}${unit}${typeof limit === 'number' ? ` (budget ${limit}${unit})` : ''}`
        );
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error(`Over budget: ${failures.join(', ')}`);
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
