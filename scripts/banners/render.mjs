// Render the release banners into public/img, in the site's dark theme: four
// formats (banner, og, square and portrait), each at 1x and 2x, as palette
// PNGs. The panel on each banner is the start page in small, the band and
// the palette tiles, with colors made by moebius itself.
//
// Usage: npm run banners -- <release>, e.g. 1.0
// The content is in scripts/banners/<release>.mjs. The PNGs are screenshots
// from the installed Google Chrome (set CHROME_PATH to use another binary),
// with the site's own font stack, made small with Python and Pillow. Run it
// again when the design or the copy changes, and commit the PNGs.
import Moebius from '@phun-ky/moebius';
import { contrast } from 'chroma-js';
import { chromium } from 'playwright-core';

import { execFileSync } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { readTokens, tokensToCss } from '../build-tokens.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const OUT = join(ROOT, 'public/img');
const FORMATS = [
  { suffix: '', width: 1200, height: 600, layout: 'wide' },
  { suffix: '-og', width: 1200, height: 630, layout: 'wide' },
  { suffix: '-square', width: 1080, height: 1080, layout: 'tall' },
  { suffix: '-portrait', width: 1080, height: 1350, layout: 'tall' }
];
const SCALES = [1, 2];
// What the page calls each palette, as PALETTE_NAMES in
// src/config/constants.ts, in the order of the palette picker
const PALETTES = {
  interpolate: 'Interpolate',
  luminanceShift: 'Luminance shift',
  monochromatic: 'Monochromatic',
  complement: 'Complement',
  split: 'Split complementary',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  pentadic: 'Pentadic',
  hexadic: 'Hexadic',
  analogous: 'Analogous'
};
const release = process.argv[2];

if (!release) {
  console.error('Usage: npm run banners -- <release>, e.g. 1.0');
  process.exit(1);
}

const { default: content } = await import(
  pathToFileURL(join(ROOT, 'scripts/banners', `${release}.mjs`)).href
);
const escape = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
// Black or white, whichever has the higher contrast, as
// src/utils/get-a11y-text-color.ts
const textOn = (color) =>
  contrast(color, '#ffffff') >= contrast(color, '#000000')
    ? '#ffffff'
    : '#000000';
const { MoebiusColor, MoebiusPalettes } = await Moebius({ colorNames: false });
// The start page's default settings, from DEFAULT_OPTIONS
const { colors } = new MoebiusPalettes({
  baseColor: new MoebiusColor(content.colors.primary, ''),
  secondaryColor: new MoebiusColor(content.colors.secondary, ''),
  divergentColor: '#f5f5f5',
  colorScaleMode: 'rgb',
  numberOfColors: 7
});
const tokens = await readTokens();
const mark = (
  await readFile(join(ROOT, 'src/assets/logo/mark.svg'), 'utf8')
).replace('<svg ', '<svg class="mark" ');
const title = content.title
  .map((part) =>
    typeof part === 'string'
      ? escape(part)
      : `<span class="accent">${escape(part.accent)}</span>`
  )
  .join('<br>');
const band = colors.interpolate
  .map(
    (hex, index, all) =>
      `<div style="background: ${hex}; color: ${textOn(hex)}">${
        index === 0 ? '<b>Primary</b>' : ''
      }${index === all.length - 1 ? '<b>Secondary</b>' : ''}<code>${hex}</code></div>`
  )
  .join('');
const tiles = Object.entries(PALETTES)
  .map(
    ([id, name]) =>
      `<div class="tile${id === 'interpolate' ? ' checked' : ''}"><span>${name}</span><i>${colors[
        id
      ]
        .map((hex) => `<i style="background: ${hex}"></i>`)
        .join('')}</i></div>`
  )
  .join('');
const page = (layout, format) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
${tokensToCss(tokens)}
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; }
body { position: relative; overflow: hidden; color: var(--moebius-color-text);
  font-family: var(--moebius-font-family-body); line-height: 1.5;
  background: var(--moebius-color-background); }
.pill { position: absolute; display: inline-flex; align-items: center; gap: 14px;
  padding: 10px 22px 10px 12px; border: 1px solid var(--moebius-color-line-strong);
  border-radius: 999px; font-size: 18px; font-weight: 500; }
.mark { width: 32px; height: 32px; }
h1 { position: absolute; color: var(--moebius-color-text-strong); font-weight: 700;
  line-height: 1.06; letter-spacing: -0.03em; }
.accent { color: var(--moebius-color-brand); }
p { position: absolute; }
.panel { position: absolute; display: flex; flex-direction: column; gap: 16px; padding: 16px;
  border: 1px solid var(--moebius-color-line-strong); border-radius: var(--moebius-radius-6);
  background: var(--moebius-color-well); }
.band { flex: 1; display: flex; border-radius: var(--moebius-radius-3); overflow: hidden; }
.band div { flex: 1; display: flex; flex-direction: column; justify-content: space-between;
  min-width: 0; padding: 10px 8px; }
.band b { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
.band code { margin-top: auto; font: 600 12px var(--moebius-font-family-code); }
.tiles { display: grid; gap: 8px; }
.tile { display: grid; gap: 8px; padding: 9px 12px; border: 1px solid var(--moebius-color-line);
  border-radius: var(--moebius-radius-3); background: var(--moebius-color-background);
  font-size: 15px; white-space: nowrap; }
.tile.checked { border-color: var(--moebius-color-link); box-shadow: inset 0 0 0 1px var(--moebius-color-link);
  color: var(--moebius-color-text-strong); font-weight: 600; }
.tile > i { display: flex; height: 10px; border-radius: 5px; overflow: hidden; }
.tile > i i { flex: 1; }
/* wide: text left, the panel right */
.wide .pill { top: 64px; left: 72px; }
.wide h1 { top: 168px; left: 72px; width: 560px; font-size: 60px; }
.wide p { bottom: 64px; left: 72px; width: 500px; font-size: 21px; }
.wide .panel { top: 56px; right: 64px; bottom: 56px; width: 480px; }
.wide .tiles { grid-template-columns: repeat(2, 1fr); gap: 6px; }
.wide .tile { gap: 6px; padding: 6px 12px; }
/* A column is too narrow for its name; the hex codes say enough */
.wide .band b { display: none; }
/* tall: text on top, the panel below */
.tall .pill { top: 80px; left: 80px; font-size: 22px; }
.tall .mark { width: 40px; height: 40px; }
.tall h1 { top: 184px; left: 80px; width: 920px; font-size: 96px; }
.tall p { top: 420px; left: 80px; width: 900px; font-size: 28px; }
.tall .panel { left: 80px; right: 80px; bottom: 80px; height: 400px; gap: 20px; padding: 20px; }
.tall .band div { padding: 14px 12px; }
.tall .band b { font-size: 14px; }
.tall .band code { font-size: 17px; }
.tall .tiles { grid-template-columns: repeat(5, 1fr); gap: 10px; }
.tall .tile { font-size: 16px; padding: 10px 12px; }
.portrait .panel { height: 640px; }
</style></head>
<body class="${format}"><main class="${layout}">
  <div class="pill">${mark}${escape(content.pill)}</div>
  <h1>${title}</h1>
  <p>${escape(content.body)}</p>
  <div class="panel"><div class="band">${band}</div><div class="tiles">${tiles}</div></div>
</main></body></html>`;
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' }
);
const paths = [];

try {
  for (const { suffix, width, height, layout } of FORMATS) {
    for (const scale of SCALES) {
      const path = join(
        OUT,
        `moebius-site-${content.slug}${suffix}${scale === 2 ? '@2x' : ''}.png`
      );
      const tab = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: scale
      });

      try {
        await tab.setContent(page(layout, suffix.slice(1)));
        await writeFile(path, await tab.screenshot());
        paths.push(path);
      } finally {
        await tab.close();
      }
    }
  }
} finally {
  await browser.close();
}

// A palette of up to 256 colors keeps the flat artwork sharp and small
execFileSync(
  'python3',
  [
    '-c',
    `import sys
from PIL import Image
for path in sys.argv[1:]:
    Image.open(path).convert('RGBA').quantize(256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)`,
    ...paths
  ],
  { stdio: 'inherit' }
);

for (const path of paths) {
  console.log(
    `wrote ${relative(ROOT, path)}: ${(await stat(path)).size} bytes`
  );
}
