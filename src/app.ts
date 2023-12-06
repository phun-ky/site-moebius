import { getParams } from './lib/spa/utils/get-params';
import { RouterMatch } from './lib/spa/types';
import { addOnAfterAppRender } from './lib/spa';

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
    try {
      const url = new URL(window.location.href);

      _hashParams = JSON.parse(atob(url.hash.replace('#options=', '')));
    } catch (e) {
      _hashParams = {};
    }
  }

  globalThis.activeElement = document.activeElement;

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
