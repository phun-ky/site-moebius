import { getParams } from './lib/spa/utils/get-params';
import { RouterMatch } from './lib/spa/types';
import { addOnAfterAppRender } from './lib/spa';
import { hideLoading } from './utils/hide-loading';
import { readHashOptions } from './utils/sanitize-options';

import { Header } from './components/page-section/Header';
import { Footer } from './components/page-section/Footer';

const html = String.raw;
const App = async (match: RouterMatch, params: unknown) => {
  let _page: string;
  let _params = params;
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
  }

  globalThis.activeElement = document.activeElement;

  // The start page hides the loading overlay once moebius is ready; every
  // other page has nothing to wait for
  if (_page !== 'StartPage') {
    addOnAfterAppRender(hideLoading);
  }

  let content = '';

  if (_page === 'StartPage') {
    const { StartPage: currentPage } = await import('./pages/StartPage');

    content = await currentPage({ params: _hashParams });
  } else if (_page === 'AboutPage') {
    const { AboutPage: currentPage } = await import('./pages/AboutPage');

    content = await currentPage();
  } else if (_page === 'ErrorPage') {
    const { ErrorPage: currentPage } = await import('./pages/ErrorPage');

    content = currentPage({ params: _params });
  } else {
    const { PageNotFoundPage: currentPage } = await import(
      './pages/PageNotFoundPage'
    );

    content = currentPage();
  }

  return html`${Header()}
    <main class="ph main">${content}</main>
    ${Footer()}`;
};

export default App;
