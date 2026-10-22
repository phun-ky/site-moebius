# Roadmap

What moebius.wtf intends to do, and not do, from October 2026 to October 2027.
It's a plan, not a promise: priorities can change, and changes to this file are
made in pull requests like any other. Individual pieces of work are tracked as
[GitHub issues](https://github.com/phun-ky/site-moebius/issues), grouped in
[milestones](https://github.com/phun-ky/site-moebius/milestones).

## Done in October 2026

The site was rebuilt from the ground up:

- **Hardening:** a strict Content Security Policy, nothing loaded from other
  hosts, pinned and reviewed dependencies, branch rules and security scanning.
- **Quality checks** in CI on every pull request: accessibility, keyboard use,
  layout at every width, performance budgets, HTML, links and metadata, and
  end-to-end tests.
- **A new design** ([#48](https://github.com/phun-ky/site-moebius/issues/48)):
  the palette in a band that stays in view, the settings in one panel, design
  tokens ([#42](https://github.com/phun-ky/site-moebius/issues/42)), and
  palettes exported as design tokens
  ([#96](https://github.com/phun-ky/site-moebius/issues/96)).

## Planned

- **The about page**
  ([#102](https://github.com/phun-ky/site-moebius/issues/102)): what the site is
  for, how the palettes and the color blind simulation work, and where the color
  names come from.
- **OpenSSF Best Practices**
  ([#47](https://github.com/phun-ky/site-moebius/issues/47)): the passing badge,
  with the answers kept in the repository.
- **Keeping it fast and accessible:** every change stays within the
  [performance budgets](performance-budgets.json) and passes the accessibility
  checks, as the [contributing guide](CONTRIBUTING.md#tests) describes.
- **A second maintainer**, so that pull requests get a review from someone other
  than the author and the site doesn't rest on one person; see
  [governance](GOVERNANCE.md#continuity).

## Considered, not scheduled

Ideas that fit the site but have no date. Each would start with a discussion in
an issue.

- **Choosing the number of colors.** A shared link can already ask for 2 to 32
  colors, but the page has no control for it, and its layout is designed for the
  default of 7.
- **More code formats,** such as Sass variables or a Tailwind CSS theme, beside
  CSS, JavaScript and design tokens.
- **New palette types,** which would first be added to the
  [moebius library](https://github.com/phun-ky/moebius).

## Not planned

- **Collecting data.** The site sets no cookies, runs no analytics and sends
  nothing about its visitors anywhere. The only thing it stores is the chosen
  theme, in the browser's local storage. A feature that needs more than that
  won't be added.
- **Accounts or saved palettes on a server.** A palette is saved by keeping its
  link, which holds the colors and settings.
- **Loading anything from other hosts,** such as web fonts, scripts or
  analytics. Everything the site needs is served by the site itself.
- **Moving off GitHub Pages.** The site is static and needs no server.
