# Security Policy

moebius is a static website: the code in this repository is built and deployed
to [moebius.wtf](https://moebius.wtf) on every merge to `main`. There is no
server, no account and no database.

## Supported Versions

Only the live site is supported. There are no releases or versions to upgrade: a
fix is live as soon as it is merged and the deploy has finished.

| Deployment                                    | Supported |
| --------------------------------------------- | --------- |
| [moebius.wtf](https://moebius.wtf), `main`    | ✅        |
| Older commits, forks and copies hosted by you | ❌        |

## Reporting a Vulnerability

Report vulnerabilities privately, either with GitHub's
[private vulnerability reporting](https://github.com/phun-ky/site-moebius/security/advisories/new)
or by email to <security@phun-ky.net>. Please don't open a public issue for a
security problem.

## How Reports Are Handled

1. **Acknowledgement:** you'll get a reply within 7 days confirming the report
   was received.
2. **Assessment:** the maintainer reproduces the issue on the live site and
   judges its severity, and may ask you for details.
3. **Fix:** a fix is developed against a draft GitHub security advisory, merged
   and deployed. The aim is a fix within 30 days for serious issues, and sooner
   when the problem can be exploited through a link.
4. **Disclosure:** the advisory is published once the fix is deployed and
   checked on the live site. There is normally no CVE, since there is nothing
   for anyone else to update. Please keep the issue private until then.
5. **Credit:** reporters are credited in the advisory, unless they ask to stay
   anonymous.

Published advisories:

| Advisory                                                                                               | Summary                                  | Fixed      |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------- |
| [GHSA-p3j7-gcj5-9743](https://github.com/phun-ky/site-moebius/security/advisories/GHSA-p3j7-gcj5-9743) | DOM XSS through the `#options=` URL hash | 2026-10-21 |

## Security Expectations

What you can rely on:

- **No accounts and nothing stored on a server.** The site has no backend and no
  forms that send data anywhere.
- **Your settings stay in your browser.** Palette settings live in the
  `#options=` part of the URL, which browsers never send to a server. The light
  or dark theme choice is kept in `localStorage`. Nothing else is stored.
- **Links can't run code.** Every option read from a URL is checked against the
  values the site supports, and anything else is ignored (see
  [`sanitize-options.ts`](src/utils/sanitize-options.ts)). Values rendered into
  the page are escaped first.
- **Deploys are traceable.** The site is built and deployed only by
  [`deploy.yml`](.github/workflows/deploy.yml) in GitHub Actions, from `main`.

What you can't rely on yet:

- **The site loads files from other hosts.** Each request shows your IP address
  to that host. Removing them is planned:

  | Host          | What                         | Issue                                                    |
  | ------------- | ---------------------------- | -------------------------------------------------------- |
  | `unpkg.com`   | Prism, for code highlighting | [#34](https://github.com/phun-ky/site-moebius/issues/34) |
  | `phun-ky.net` | Shared stylesheets           | [#34](https://github.com/phun-ky/site-moebius/issues/34) |

- **No Content Security Policy yet.** GitHub Pages can't send security headers,
  so a `<meta>` policy is planned in
  [#35](https://github.com/phun-ky/site-moebius/issues/35).
- **Colour names are trusted as text.** Names come from
  [color-name-list](https://github.com/meodai/color-names) (MIT), are built into
  `/data/colornames.json` and served from this site. They are escaped before
  they are rendered, but their wording is shown as it comes.

## Dependencies

**Choosing them.** The site bundles three runtime libraries (`@phun-ky/moebius`,
`chroma-js` and `diff-dom`); everything else is a development dependency. A new
runtime dependency is discussed in an issue first, and must be widely used,
actively maintained and under an OSI-approved licence compatible with MIT.

**Obtaining them.** Packages come only from the npm registry, with exact
versions locked in `package-lock.json` and installed with `npm ci` in CI. GitHub
Actions are pinned to commit SHAs.

**Tracking them.** Dependabot proposes version updates weekly and security
updates as soon as an advisory is published. Every pull request runs
[dependency review](.github/workflows/dependency-review.yml).

**Fixing known vulnerabilities.** Findings are checked against the GitHub
Advisory Database:

| Finding                    | Where                              | What happens                                                            |
| -------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| Critical or high           | Runtime dependency (in the bundle) | Blocks merging (dependency review); fixed and deployed within 7 days    |
| Critical or high           | Development dependency             | Blocks merging when introduced; an existing one is fixed within 30 days |
| Moderate or low            | Any dependency                     | Fixed with the next update, within 90 days                              |
| Licence outside the policy | New dependency                     | Not merged                                                              |

## Code Scanning

CodeQL analyses every pull request and every push to `main`, for the TypeScript
code and the GitHub Actions workflows. OpenSSF Scorecard runs on every push to
`main` and weekly:
[scorecard.dev](https://scorecard.dev/viewer/?uri=github.com/phun-ky/site-moebius).

## Secrets

The project has no secrets. Deploying to GitHub Pages uses a short-lived OIDC
token that GitHub issues to the deploy job only. Secret scanning with push
protection blocks commits that contain a credential.
