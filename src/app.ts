import { Footer } from './components/page-section/Footer';
import { Header } from './components/page-section/Header';
import metadata from './config/pages.json';
import { addOnAfterAppRender } from './lib/spa';
import { RouterMatch } from './lib/spa/types';
import { getParams } from './lib/spa/utils/get-params';
import { hideLoading } from './utils/hide-loading';
import { readHashOptions } from './utils/sanitize-options';

const html = String.raw;
const App = async (match: RouterMatch, params: unknown) => {
  let _page: string;
  let _params: unknown;
  let _hashParams = {};

  if (typeof match === 'string') {
    _params = params;
    _page = 'ErrorPage';
  } else {
    const { route } = match;
    const { page } = route;

    if (!page) {
      _page = 'ErrorPage';
    } else {
      _page = page;
    }

    _params = getParams(match);
    _hashParams = readHashOptions();

    // The built HTML has the title of the page it was opened on; moving to
    // another page changes it here
    document.title =
      metadata.pages[route.path as keyof typeof metadata.pages]?.title ??
      metadata.name;
  }

  globalThis.activeElement = document.activeElement;

  // The start page hides the loading overlay once moebius is ready; every
  // other page has nothing to wait for
  if (_page !== 'StartPage') {
    addOnAfterAppRender(hideLoading);
  }

  let content: string;

  if (_page === 'StartPage') {
    const { StartPage: currentPage } = await import('./pages/StartPage');

    content = await currentPage({ params: _hashParams });
  } else if (_page === 'AboutPage') {
    const { AboutPage: currentPage } = await import('./pages/AboutPage');

    content = await currentPage();
  } else if (_page === 'ErrorPage') {
    const { ErrorPage: currentPage } = await import('./pages/ErrorPage');

    content = currentPage({ params: _params as { error?: unknown } });
  } else {
    const { PageNotFoundPage: currentPage } =
      await import('./pages/PageNotFoundPage');

    content = currentPage();
  }

  // The header marks the link to the page being shown
  const path = typeof match === 'string' ? undefined : match.route.path;

  return html`${Header({ path })}
    <main class="ph main" id="content" tabindex="-1">${content}</main>
    ${Footer()}`;
};

export default App;
