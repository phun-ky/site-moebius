const html = String.raw;

import './styles/header.css';

import logoSvg from './logo.svg?raw';

// GitHub's mark, for the link to the source
const githubIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 16 16"
  fill="currentColor"
  aria-hidden="true"
  class="ph"
>
  <path
    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.34.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
  />
</svg>`;
// The site's own pages, in the order the header lists them
const PAGES = [
  { path: '/', name: 'Palettes' },
  { path: '/about', name: 'About' }
];
const COFFEE = 'https://www.paypal.me/phunky/20';
const SPONSOR = 'https://github.com/sponsors/phun-ky';
const SOURCE = 'https://github.com/phun-ky/site-moebius';
const NEW_TAB = '<span class="ph visually-hidden"> (opens in a new tab)</span>';
/**
 * A link, always on one line: diff-dom, which renders these templates, does
 * not close a tag written as `</a` + newline + `>`, and Prettier splits long
 * tags in `html` templates. This template is untagged, so Prettier leaves it.
 * @param {string} attributes - The link's attributes.
 * @param {string} content - What it shows.
 * @returns {string} The link.
 */
const link = (attributes: string, content: string) =>
  `<a ${attributes}>${content}</a>`;

export type MoebiusSiteHeaderPropsType = {
  // The path of the page being shown, to mark its link as current
  path?: string;
};

export const Header = ({ path }: MoebiusSiteHeaderPropsType = {}) => {
  const links = PAGES.map((page) =>
    link(
      `class="ph" href="${page.path}" data-link="${page.path}"${page.path === path ? ' aria-current="page"' : ''}`,
      page.name
    )
  ).join('');

  return html`<header class="ph header">
    <a class="ph skip-link" href="#content">Skip to content</a>
    ${link('class="ph home" href="/" data-link="/" aria-label="moebius home"', logoSvg)}
    <nav class="ph site-nav" aria-label="Site">${links}</nav>
    <div class="ph header-menu">
      <div class="ph support">
        ${link(`class="ph" href="${COFFEE}" rel="noopener noreferrer" target="_blank"`, `Buy me a coffee${NEW_TAB}`)}
        ${link(`class="ph" href="${SPONSOR}" rel="noopener noreferrer" target="_blank"`, `Sponsor${NEW_TAB}`)}
      </div>
      ${link(`class="ph icon-button" href="${SOURCE}" aria-label="Source on GitHub"`, githubIcon)}
      <button
        class="ph icon-button darkmode-button"
        aria-label="Switch between light and dark theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Sun Icon"
          fill="currentColor"
          stroke="none"
          class="ph hide-dark"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Moon Icon"
          fill="currentColor"
          stroke="none"
          class="ph hide-light"
          viewBox="0 0 20 20"
        >
          <path
            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
          />
        </svg>
      </button>
    </div>
  </header>`;
};
