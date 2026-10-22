// Global events
import { DOMContentLoaded } from './lib/spa/utils/dom-content-loaded';
import { eventAfterAppRender } from './lib/spa/utils/event-after-app-render';
import { popstate } from './lib/spa/utils/popstate';
import { initTheme } from './utils/theme';

// Styles: the design tokens (made from tokens/ at build), then, in the order
// the page used to load them, the base page styles, the shared phun-ky.net
// styles, the site's own, and code highlighting
import 'virtual:moebius-tokens.css';
import './styles/base.css';
import './styles/vendor/phun-ky/ph.css';
import './styles/index.css';
import './prism';

// The theme button and the system setting
initTheme();

// The skip link moves focus to the content without changing the URL hash,
// which holds the palette settings
document.addEventListener('click', (event) => {
  if (!(event.target as Element | null)?.closest?.('.ph.skip-link')) return;

  event.preventDefault();
  document.getElementById('content')?.focus();
});

// The settings forms have nothing to submit to; this replaces inline
// onsubmit handlers, which the Content Security Policy blocks
document.addEventListener('submit', (event) => event.preventDefault());

// Events that happens on URL change in our SPA
window.addEventListener('popstate', popstate);
// window.addEventListener('hashchange', popstate);
// Events that happens after DOM is loaded
document.addEventListener('DOMContentLoaded', DOMContentLoaded);
// Events that happens after eveyr App render
document.addEventListener('eventAfterAppRender', eventAfterAppRender);
