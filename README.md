<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/phun-ky/site-moebius/main/docs/img/banner-dark.png">
  <img alt="moebius: color palettes and a color blind simulator" src="https://raw.githubusercontent.com/phun-ky/site-moebius/main/docs/img/banner-light.png" width="640">
</picture>

[![Checks](https://github.com/phun-ky/site-moebius/actions/workflows/check.yml/badge.svg)](https://github.com/phun-ky/site-moebius/actions/workflows/check.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/phun-ky/site-moebius/badge)](https://scorecard.dev/viewer/?uri=github.com/phun-ky/site-moebius)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[moebius.wtf](https://moebius.wtf)** makes color palettes from two colors you
pick, shows how they look to people with color blindness, and gives you the code
to use them.

- [What it does](#what-it-does)
- [How it's built](#how-its-built)
- [Development](#development)
  - [Checks](#checks)
  - [Design tokens and logo](#design-tokens-and-logo)
- [Deploying](#deploying)
- [Project documents](#project-documents)
- [Credits](#credits)

## What it does

- **Ten palettes** from the colors you pick: interpolate, luminance shift,
  monochromatic, complement, split complementary, triadic, tetradic, pentadic,
  hexadic and analogous, each with nine shades of every color.
- **Blend modes and corrections:** blend in rgb, lab, lrgb, hsl or lch, with
  bezier interpolation, lightness correction, no duplicates and reverse
  direction.
- **A color blind simulator** for eight types of color blindness, and a note
  when a palette has colors that people with one of them can hardly tell apart.
- **Code to copy:** CSS custom properties, a JavaScript array, or design tokens
  in the
  [Design Tokens Community Group format](https://www.designtokens.org/TR/2025.10/).
- **Links that keep your settings:** the colors, settings and chosen palette are
  stored in the page address, so a link opens the same palettes.
- **Names for every color**, from color-name-list.

The site sets no cookies and runs no analytics. The only thing it stores is your
light or dark theme, in your browser's local storage. Everything else happens in
your browser.

## How it's built

A small single-page app in TypeScript, built with [Vite](https://vite.dev/) and
served by GitHub Pages. The palettes come from
[moebius](https://github.com/phun-ky/moebius), a library by the same author. The
color names are converted at build time from
[color-name-list](https://github.com/meodai/color-names) and served from the
site itself, like everything else: the page loads nothing from other hosts, and
a strict Content Security Policy keeps it that way.

| Folder                  | What it holds                                                     |
| ----------------------- | ----------------------------------------------------------------- |
| [`src/`](src)           | The app: pages, components, styles and the color blind simulation |
| [`tokens/`](tokens)     | The design tokens, turned into CSS at build time                  |
| [`public/`](public)     | Files served as they are: favicons, icons, the social card        |
| [`scripts/`](scripts)   | Build steps and the checks that run in CI                         |
| [`e2e/`](e2e)           | End-to-end tests with Playwright                                  |
| [`docs/img/`](docs/img) | The banners in this README                                        |

## Development

You need [Node.js](https://nodejs.org/) 24, which CI uses, and Google Chrome for
the browser checks and end-to-end tests. Set `CHROME_PATH` to use another Chrome
or Chromium.

```sh
npm ci          # install, and point git at the commit hook in .githooks
npm run dev     # a dev server at http://localhost:5173
npm run build   # build the site into dist/
```

### Checks

Every pull request runs all of these, and must pass them to merge.

| Command                     | What it checks                                                                    |
| --------------------------- | --------------------------------------------------------------------------------- |
| `npm run typecheck`         | TypeScript, in strict mode                                                        |
| `npm run lint`              | [ESLint](https://eslint.org/) with `eslint-config-phun-ky`                        |
| `npm run format:check`      | [Prettier](https://prettier.io/) formatting                                       |
| `npm test`                  | Unit tests with `node:test`; `npm run test:coverage` also measures coverage       |
| `npm run test:e2e`          | End-to-end tests with Playwright, at desktop and phone size                       |
| `npm run check:dist`        | The build has no source maps and its JavaScript is minified                       |
| `npm run check:layout`      | No sideways scrolling at seven widths; screenshots of every page                  |
| `npm run check:origins`     | Nothing loads from other hosts                                                    |
| `npm run check:csp`         | No Content Security Policy violations                                             |
| `npm run check:a11y`        | No [axe](https://github.com/dequelabs/axe-core) violations of WCAG 2.2 AA         |
| `npm run check:keyboard`    | Everything works with the keyboard                                                |
| `npm run check:performance` | The [performance budgets](performance-budgets.json) on a throttled phone          |
| `npm run check:routes`      | Every page answers as GitHub Pages serves it, and unknown paths get 404           |
| `npm run check:theme`       | The theme follows the system setting until you choose one                         |
| `npm run check:html`        | The HTML is valid, as built and as rendered                                       |
| `npm run check:links`       | Every link, asset and anchor works; `check:links:external` checks other sites too |
| `npm run check:metadata`    | Titles, descriptions, canonical URLs, the social card, sitemap and robots.txt     |

The `check:` scripts and the end-to-end tests need a build first.

### Design tokens and logo

Colors, fonts, sizes and shadows are design tokens in [`tokens/`](tokens), in
the Design Tokens Community Group format. The build turns them into CSS custom
properties; see the [tokens README](tokens/README.md). Change the tokens, not
the generated CSS.

The logo is [`src/assets/logo/mark.svg`](src/assets/logo/mark.svg). After
changing it, run `npm run render:assets` to redraw the favicons, icons, social
card and banners, and commit them.

## Deploying

Every merge to `main` is built and deployed to GitHub Pages by the
[Deploy workflow](.github/workflows/deploy.yml). There are no releases or
versions; `main` is what the site runs.

## Project documents

- [Contributing](CONTRIBUTING.md): how to report bugs, suggest changes and
  contribute code
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md): how to report a vulnerability
- [Governance](GOVERNANCE.md): who decides, and what happens if they can't
- [Roadmap](ROADMAP.md): what's planned, and what isn't
- [License](LICENSE): MIT

## Credits

- Color names from [color-name-list](https://github.com/meodai/color-names) by
  David Aerne, under the
  [MIT License](https://github.com/meodai/color-names/blob/main/LICENSE).
- The color blind simulation follows Machado, Oliveira and Fernandes, "A
  Physiologically-based Model for Simulation of Color Vision Deficiency", IEEE
  Transactions on Visualization and Computer Graphics, 2009
  (doi:10.1109/TVCG.2009.113).
- Made by [Alexander Vassbotn Røyne-Helgesen](https://phun-ky.net).
