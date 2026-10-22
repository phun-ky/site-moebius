# Contributing to moebius.wtf

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the
[Table of Contents](#table-of-contents) for different ways to help and details
about how this project handles them. Please read the relevant section before
making your contribution. It makes it a lot easier for the maintainer and
smooths out the experience for everyone involved.

> And if you like the project, but don't have time to contribute, that's fine.
> There are other easy ways to support the project and show your appreciation:
>
> - Star the project
> - Share [moebius.wtf](https://moebius.wtf) with people who work with color
> - Tell your friends and colleagues about it

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Contributing Code](#contributing-code)
    - [Coding Style](#coding-style)
    - [Tests](#tests)
    - [Design Tokens and the Logo](#design-tokens-and-the-logo)
    - [Developer Certificate of Origin](#developer-certificate-of-origin)
    - [Commits and Pull Requests](#commits-and-pull-requests)
- [Attribution](#attribution)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold this code. Please report unacceptable behaviour to
<code-of-conduct@phun-ky.net>.

## I Have a Question

Before you ask a question, search the existing
[issues](https://github.com/phun-ky/site-moebius/issues) that might help you. If
you find a suitable issue and still need clarification, write your question in
that issue.

If you still need to ask a question:

- Open an [issue](https://github.com/phun-ky/site-moebius/issues/new).
- Provide as much context as you can about what you're running into.
- Name your browser and its version, and include the link to the palettes, so
  others see the same colors and settings.

Questions about how the palettes themselves are made belong to the
[moebius library](https://github.com/phun-ky/moebius/issues).

## I Want To Contribute

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100%
> of the content, that you have the necessary rights to the content and that the
> content you contribute may be provided under the project licence. You confirm
> this on every commit by signing it off under the
> [Developer Certificate of Origin](#developer-certificate-of-origin).

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more
information. Please:

- Reload [moebius.wtf](https://moebius.wtf) to make sure you have the latest
  version; every merge is deployed right away.
- Search the
  [bug tracker](https://github.com/phun-ky/site-moebius/issues?q=label%3A%22problems%3A+%F0%9F%90%9B+bug%22)
  to see if the bug has already been reported.
- Collect information about the bug:
  - the link to the page, with your colors and settings in it
  - what you did, what you expected, and what happened
  - your browser, its version and the operating system, and whether it happens
    in another browser too
  - any errors in the browser's console

#### How Do I Submit a Good Bug Report?

> Never report security issues, vulnerabilities or bugs that include sensitive
> information in the issue tracker or elsewhere in public. Report them privately
> as described in the [security policy](SECURITY.md).

Bugs are tracked as GitHub issues. If you run into a problem:

- Open an [issue](https://github.com/phun-ky/site-moebius/issues/new) with the
  bug report template.
- Explain the behaviour you expected and the actual behaviour.
- Describe the steps to reproduce it.
- Add the information you collected above. A screenshot helps for anything
  visual.

Once it's filed, the maintainer labels it and tries to reproduce it. Without a
way to reproduce it, the issue is marked `pending: need repro` until there is
one. A reproduced bug is marked `🐛 needs fix`.

### Suggesting Enhancements

Enhancements, from new features to small improvements, are tracked as
[GitHub issues](https://github.com/phun-ky/site-moebius/issues).

Before suggesting one:

- [Search](https://github.com/phun-ky/site-moebius/issues) for an existing
  suggestion, and add to it instead of opening a new one.
- Check that it fits the [roadmap](ROADMAP.md), including what is not planned.
- If it's about the palettes themselves, such as a new harmony, suggest it for
  the [moebius library](https://github.com/phun-ky/moebius/issues), which makes
  them.

A good suggestion has a clear title, describes the current behaviour and the
behaviour you'd like instead, and explains why it would be useful to most people
using the site.

### Contributing Code

Set up the project as described in the [README](README.md#development): Node.js
24 and Google Chrome, then `npm ci`, `npm run build` and `npm test`. Larger
changes are best discussed in an issue first, so the work fits the
[roadmap](ROADMAP.md).

#### Coding Style

Code follows the project's [ESLint](https://eslint.org/) configuration
(`eslint-config-phun-ky`), [Prettier](https://prettier.io/) formatting and
TypeScript in strict mode. A contribution must pass `npm run lint`,
`npm run format:check` and `npm run typecheck` with no errors.

Some rules specific to this site:

- **Nothing from other hosts.** Scripts, styles, fonts, images and data are
  served by the site itself, and the Content Security Policy blocks the rest.
  `npm run check:origins` and `npm run check:csp` enforce it.
- **No inline scripts or `<style>` elements.** Style attributes are allowed.
- **Templates are HTML strings** rendered by diff-dom, which can't read a
  closing tag split over lines. Keep each `<a>`, `<label>` and similar element
  on one line; a unit test fails if a closing tag is split.
- **Everything works with the keyboard and a screen reader,** in both themes and
  at every width from 320 px.

#### Tests

- **New functionality must come with tests:** unit tests in a `__tests__` folder
  next to the code, run by `npm test`, and end-to-end tests in [`e2e/`](e2e) for
  anything people do in the browser.
- **Bug fixes must come with a regression test** that fails without the fix.
- **Coverage must not drop.** `npm run test:coverage` fails when the code it
  measures, the utilities, features, configuration and the router, falls below
  80% of lines.
- **The browser checks must pass:** layout, accessibility, keyboard, Content
  Security Policy, performance budgets, HTML, links and metadata. The
  [README](README.md#checks) lists them. Run the ones your change touches before
  you push; CI runs all of them.
- **A change that adds bytes** must stay within the
  [performance budgets](performance-budgets.json). Raising a budget needs a
  reason in the pull request.

#### Design Tokens and the Logo

- **Colors, fonts, sizes and shadows** are design tokens in [`tokens/`](tokens).
  Use the `--moebius-` custom properties in CSS, and add a token rather than a
  fixed value; see the [tokens README](tokens/README.md).
- **The logo** is [`src/assets/logo/mark.svg`](src/assets/logo/mark.svg). After
  changing it, run `npm run render:assets` and commit the files it writes.

#### Developer Certificate of Origin

Every commit must be signed off under the
[Developer Certificate of Origin](https://developercertificate.org/) (DCO): a
statement that you wrote the change, or otherwise have the right to submit it
under the project's licence. You agree to it by adding a `Signed-off-by` line
with your name and email to the commit message:

```text
Signed-off-by: Your Name <you@example.com>
```

- **Per commit:** `git commit -s` adds the line for you.
- **Always:** `npm ci` sets `core.hooksPath` to `.githooks`, and the hook in
  `.githooks/prepare-commit-msg` adds the line to every commit.
- **Forgot?** Sign off every commit on your branch and push again:
  `git rebase --signoff main` then `git push --force-with-lease`.

The DCO check on every pull request fails if a commit isn't signed off.

#### Commits and Pull Requests

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/),
  with the project's emoji: `feat: 🎸` for something new, `fix: 🐛` for a bug,
  `docs: ✏️`, `refactor: 💡`, `test: 💍`, `chore: 🤖` and `ci: 🎡`.
- The site has no releases: every merge to `main` is deployed. A pull request
  must leave the site working and looking right on its own.
- Open a pull request against `main`, with what it changes, how to test it and
  the issue it closes. The Checks workflow builds the site and runs every check
  and test; all of it must pass before it can be merged.

## Attribution

This guide is based on
[contributing-gen](https://github.com/bttger/contributing-gen).
