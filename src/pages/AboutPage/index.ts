import { PALETTE_NAMES } from 'config/constants';

import './styles/about.css';

const html = String.raw;
const SOURCE = 'https://github.com/phun-ky/site-moebius';
const LIBRARY = 'https://github.com/phun-ky/moebius';
const NAMES = 'https://github.com/meodai/color-names';
const NAMES_LICENSE = '/data/colornames.LICENSE.txt';
const AUTHOR = 'https://phun-ky.net';
const PAGES_PRIVACY =
  'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement';
// The start page's default palette, as a strip under the heading
const DEFAULT_PALETTE = [
  '#003f5c',
  '#2b4e4d',
  '#555d3d',
  '#806c2e',
  '#aa7b1f',
  '#d58a0f',
  '#ff9900'
];
// What each palette is, measured with the default colors (#102)
const PALETTES: Record<string, string> = {
  interpolate: 'Steps from the primary to the secondary color.',
  luminanceShift:
    'The primary color’s hue, from dark to light. With Diverging on, it becomes a diverging palette: the primary color on one side, the divergent color in the middle and the secondary color’s hue on the other.',
  monochromatic:
    'The primary color, darkening to black. Reverse direction runs it the other way, away from black, and Random offset varies the steps at random.',
  complement: 'From the primary color to its complement.',
  split: 'The primary color through its split complements.',
  triadic: 'The primary color and two more, evenly around the color wheel.',
  tetradic: 'The primary color and three more, evenly around the color wheel.',
  pentadic: 'The primary color and four more, evenly around the color wheel.',
  hexadic: 'The primary color and five more, evenly around the color wheel.',
  analogous: 'The primary color and its neighboring hues.'
};
/**
 * A link, on one line: diff-dom, which renders the page, can't read a
 * closing tag split over lines, and this template is untagged, so Prettier
 * leaves it alone.
 * @param {string} href - Where it goes.
 * @param {string} text - What it says.
 * @returns {string} The link.
 */
const link = (href: string, text: string) =>
  `<a class="ph" href="${href}">${text}</a>`;

export const AboutPage = async () => {
  const strip = DEFAULT_PALETTE.map(
    (hex) => `<i style="background-color: ${hex}"></i>`
  ).join('');
  const palettes = Object.entries(PALETTES)
    .map(
      ([id, text]) =>
        `<dt class="ph">${PALETTE_NAMES[id]}</dt><dd class="ph">${text}</dd>`
    )
    .join('');

  return html`<article class="ph container about">
    <header class="ph about-head">
      <h1 class="ph">About moebius</h1>
      <span class="ph about-strip" aria-hidden="true">${strip}</span>
      <p class="ph lead">
        moebius makes color palettes from colors you pick, shows how they look
        to people with color blindness, and gives you the code to use them. It
        is for designers and developers working on interfaces, charts and design
        systems.
      </p>
    </header>

    <section class="ph" aria-labelledby="about-colors">
      <h2 class="ph" id="about-colors">Your colors</h2>
      <p class="ph">
        Every palette starts from the primary color. The secondary color is
        where the interpolate palette ends, and the divergent color is the
        middle of a diverging palette. Pick a color with the swatch, type its
        hex code, or click any color on the page to make it the primary color;
        clicking also copies its hex code.
      </p>
      <p class="ph">
        The colors, the settings and the palette you chose are kept in the
        address of the page, so a link opens the same palettes for anyone.
      </p>
    </section>

    <section class="ph" aria-labelledby="about-palettes">
      <h2 class="ph" id="about-palettes">The palettes</h2>
      <p class="ph">
        The palettes are made by ${link(LIBRARY, 'the moebius library')}. Each
        has seven colors by default, and every color has nine shades, from the
        color itself toward black.
      </p>
      <dl class="ph palette-list">${palettes}</dl>
    </section>

    <section class="ph" aria-labelledby="about-blend">
      <h2 class="ph" id="about-blend">Blending and corrections</h2>
      <p class="ph">
        <strong class="ph">Blend</strong> sets the color space the steps are
        mixed in: rgb, lab, lrgb (linear rgb), hsl or lch. The same two colors
        give different steps in each.
      </p>
      <ul class="ph">
        <li class="ph">
          <strong class="ph">Bezier</strong> draws a smooth curve through the
          colors instead of straight steps, for interpolate, luminance shift and
          monochromatic.
        </li>
        <li class="ph">
          <strong class="ph">Correct lightness</strong> evens out the lightness
          between the steps, for every palette but monochromatic.
        </li>
        <li class="ph">
          <strong class="ph">No duplicates</strong> drops colors that come out
          the same.
        </li>
        <li class="ph">
          <strong class="ph">Reverse direction</strong> changes the
          monochromatic palette only, as described above.
        </li>
      </ul>
    </section>

    <section class="ph" aria-labelledby="about-color-blindness">
      <h2 class="ph" id="about-color-blindness">Color blindness</h2>
      <p class="ph">
        The simulator shows the colors as people with one of eight types of
        color blindness see them. Protanomaly and protanopia, deuteranomaly and
        deuteranopia, and tritanomaly and tritanopia follow the model by
        Machado, Oliveira and Fernandes (2009). Achromatopsia shows the colors
        by their luminance alone, and achromatomaly goes 60% of the way there.
      </p>
      <p class="ph">
        Every palette is also checked for colors that look clearly different to
        most people but almost the same through one of these types. When it has
        any, a note under the palette tiles names the types.
      </p>
    </section>

    <section class="ph" aria-labelledby="about-code">
      <h2 class="ph" id="about-code">Code and color names</h2>
      <p class="ph">
        The code box gives the palette and its shades as CSS custom properties,
        a JavaScript array, or design tokens in the Design Tokens Community
        Group format, which design tools and token pipelines read.
      </p>
      <p class="ph">
        Every color is named after the nearest of the 31,918 colors in
        ${link(NAMES, 'color-name-list')} by David Aerne, under the
        ${link(NAMES_LICENSE, 'MIT License')}.
      </p>
    </section>

    <section class="ph" aria-labelledby="about-privacy">
      <h2 class="ph" id="about-privacy">Privacy</h2>
      <p class="ph">
        The site sets no cookies, runs no analytics and loads nothing from other
        sites. It stores one thing: your light or dark theme, in your browser.
        Everything else happens in your browser. GitHub Pages, which hosts the
        site, keeps its own logs; see
        ${link(PAGES_PRIVACY, 'GitHub’s privacy statement')}.
      </p>
    </section>

    <section class="ph" aria-labelledby="about-who">
      <h2 class="ph" id="about-who">Who made it</h2>
      <p class="ph">
        moebius is made by ${link(AUTHOR, 'Alexander Vassbotn Røyne-Helgesen')}
        and is open source under the MIT License. The
        ${link(SOURCE, 'source is on GitHub')}, with how to report a bug,
        suggest a change or report a security issue.
      </p>
      <p class="ph">
        <a class="ph button-link" href="/" data-link="/">Make a palette</a>
      </p>
    </section>
  </article>`;
};
