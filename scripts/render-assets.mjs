// Render the logo's asset set from src/assets/logo/mark.svg (#43): the
// favicons, the icons for the web app manifest and the Apple home screen,
// the social card, and the README banners for GitHub's light and dark
// themes. The PNGs are screenshots from the installed Google Chrome (set
// CHROME_PATH to use another binary), so text uses the site's own font
// stack. Run `npm run render:assets` after changing the mark, and commit
// what it writes.
import { chromium } from 'playwright-core';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readTokens } from './build-tokens.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MARK = join(ROOT, 'src/assets/logo/mark.svg');

/**
 * An ICO file holding PNG images, which browsers read for favicon.ico.
 * @param {{ size: number, png: Buffer }[]} images - The images, square.
 * @returns {Buffer} The ICO file.
 */
export const toIco = (images) => {
  const header = Buffer.alloc(6);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;

  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);

    // 0 means 256 pixels
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;

    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
};

/**
 * The value of a color token as CSS.
 * @param {Map<string, { value: { hex: string } }>} tokens - Flat tokens.
 * @param {string} path - Such as `color.background`.
 * @returns {string} The hex code.
 */
const hex = (tokens, path) => tokens.get(path).value.hex;
/**
 * A page with the mark and, optionally, text beside it.
 * @param {object} options - What to draw.
 * @returns {string} The page.
 */
const page = ({
  mark,
  size,
  width,
  height,
  background,
  text,
  lines = [],
  padding = 0
}) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
html, body { margin: 0; }
body {
  width: ${width}px; height: ${height}px; box-sizing: border-box;
  padding: 0 ${padding}px;
  display: flex; align-items: center; justify-content: center;
  gap: ${Math.round(size * 0.18)}px;
  background: ${background};
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  color: ${text};
}
.mark { width: ${size}px; height: ${size}px; flex: none; }
.mark svg { width: 100%; height: 100%; display: block; }
.text { display: grid; gap: ${Math.round(size * 0.06)}px; min-width: 0; }
.text p { margin: 0; }
.name { font-size: ${Math.round(size * 0.36)}px; font-weight: 650; letter-spacing: -0.01em; }
.line { font-size: ${Math.round(size * 0.13)}px; opacity: 0.85; }
.url { font-size: ${Math.round(size * 0.1)}px; opacity: 0.7; }
</style></head><body><div class="mark">${mark}</div>${
  lines.length
    ? `<div class="text">${lines.map(([cls, words]) => `<p class="${cls}">${words}</p>`).join('')}</div>`
    : ''
}</body></html>`;
const main = async () => {
  const mark = await readFile(MARK, 'utf8');
  const { base, themes } = await readTokens();
  const dark = new Map([...base, ...themes.dark]);
  const light = new Map([...base, ...themes.light]);
  // The app's background, as in the web app manifest
  const appBackground = '#262831';
  const words = [
    ['name', 'moebius'],
    ['line', 'Color palettes and a color blind simulator'],
    ['url', 'moebius.wtf']
  ];
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const shot = async (html, width, height, transparent = false) => {
    const tab = await browser.newPage({ viewport: { width, height } });

    try {
      await tab.setContent(html);

      return await tab.screenshot({ omitBackground: transparent });
    } finally {
      await tab.close();
    }
  };
  const icon = (size, background, padding = 0) =>
    shot(
      page({
        mark,
        size: Math.round(size * (1 - 2 * padding)),
        width: size,
        height: size,
        background
      }),
      size,
      size,
      background === 'transparent'
    );
  const outputs = {};

  try {
    outputs['public/favicon.svg'] = mark;
    outputs['public/favicon.ico'] = toIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({
          size,
          png: await icon(size, 'transparent')
        }))
      )
    );
    // Home screens crop the corners, so the mark keeps some distance
    outputs['public/img/meta/apple-touch-icon.png'] = await icon(
      180,
      appBackground,
      0.12
    );

    for (const size of [192, 512]) {
      outputs[`public/img/meta/android-chrome-${size}x${size}.png`] =
        await icon(size, appBackground, 0.12);
    }

    outputs['public/img/social-card.png'] = await shot(
      page({
        mark,
        size: 300,
        width: 1200,
        height: 630,
        padding: 96,
        background: hex(dark, 'color.background'),
        text: hex(dark, 'color.text-strong'),
        lines: words
      }),
      1200,
      630
    );

    // GitHub shows the README on its own background, light or dark
    for (const [theme, tokens] of [
      ['dark', dark],
      ['light', light]
    ]) {
      outputs[`docs/img/banner-${theme}.png`] = await shot(
        page({
          mark,
          size: 200,
          width: 1280,
          height: 320,
          background: 'transparent',
          text: hex(tokens, 'color.text-strong'),
          lines: words.slice(0, 2)
        }),
        1280,
        320,
        true
      );
    }
  } finally {
    await browser.close();
  }

  for (const [file, content] of Object.entries(outputs)) {
    await mkdir(dirname(join(ROOT, file)), { recursive: true });
    await writeFile(join(ROOT, file), content);
    console.log(`wrote ${file}`);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
