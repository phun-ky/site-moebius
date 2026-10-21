import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import globalJsdom from 'global-jsdom';

globalJsdom('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://moebius.wtf/'
});

// Node has its own CustomEvent, which jsdom's dispatchEvent rejects
globalThis.CustomEvent = window.CustomEvent;

const { router } = await import('../router');
const { routes } = await import('../router/routes');
const { getRouterMatch } = await import('../router/utils/get-router-match');
const { potentialMatchesMapper } =
  await import('../router/utils/potential-matches-mapper');
const { eventMatches } = await import('../utils/event-matches');
const { getParams } = await import('../utils/get-params');
const { setTitle } = await import('../utils/set-title');
const { stringToHTML } = await import('../utils/string-to-html');
const { updateNodes } = await import('../utils/update-nodes');
const { waitFor } = await import('../utils/wait-for');

const go = (path: string) => history.replaceState(null, '', path);

describe('router matching', () => {
  it('matches the start page and the about page', () => {
    go('/');
    assert.equal(getRouterMatch(routes).route.page, 'StartPage');
    go('/about');
    assert.equal(getRouterMatch(routes).route.page, 'AboutPage');
  });

  it('falls back to the not-found page with the path', () => {
    go('/nope');

    const match = getRouterMatch(routes);

    assert.equal(match.route.page, 'PageNotFoundPage');
    assert.deepEqual(match.result, ['/nope']);
  });

  it('maps a route to its match result', () => {
    go('/about');
    assert.equal(potentialMatchesMapper(routes[1]).result?.[0], '/about');
    assert.equal(potentialMatchesMapper({ name: 'No regex' }).result, null);
  });
});

describe('getParams', () => {
  it('reads named parameters from the path', () => {
    const route = {
      name: 'Color',
      path: '/color/:hex/:mode',
      regex: /^\/color\/(\w+)\/(\w+)$/
    };

    assert.deepEqual(
      getParams({ route, result: '/color/ff9900/lab'.match(route.regex) }),
      {
        hex: 'ff9900',
        mode: 'lab'
      }
    );
  });

  it('returns {} without a match or a path', () => {
    assert.deepEqual(getParams({ route: { name: 'x' }, result: null }), {});
    assert.deepEqual(
      getParams({
        route: { name: 'x' },
        result: ['/'] as unknown as RegExpMatchArray
      }),
      {}
    );
  });
});

describe('router', () => {
  it('reports a route change and announces it', () => {
    const scrollTo = mock.fn();
    const events: string[] = [];

    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    document.addEventListener('eventBeforeRouteChanged', () =>
      events.push('changed')
    );

    go('/');

    const first = router();

    assert.equal(first.page.route.page, 'StartPage');
    assert.equal(first.routeChanged, true);

    go('/about');
    assert.equal(router().routeChanged, true);
    assert.ok(scrollTo.mock.callCount() >= 2);

    go('/about');
    assert.equal(router().routeChanged, false);
    assert.equal(events.length, 2);
  });
});

describe('DOM helpers', () => {
  it('setTitle sets the document title', () => {
    setTitle('About');
    assert.equal(document.title, 'About');
  });

  it('stringToHTML parses markup into a body element', () => {
    const body = stringToHTML('<p class="x">Hi</p>');

    assert.equal(body.querySelector('p.x')?.textContent, 'Hi');
  });

  it('updateNodes patches the root to the new markup', () => {
    const root = document.getElementById('root')!;

    root.innerHTML = '<div class="ph app project"><p>old</p></div>';
    updateNodes(root, '<p>new</p><span>added</span>');

    assert.equal(root.querySelector('p')?.textContent, 'new');
    assert.equal(root.querySelector('span')?.textContent, 'added');
  });

  it('waitFor resolves after the delay', async () => {
    const start = Date.now();

    await waitFor(20);
    assert.ok(Date.now() - start >= 15);
  });

  it('eventMatches finds the target or its closest match', () => {
    document.body.innerHTML =
      '<a data-link="/about" href="/about"><span>About</span></a>';

    const link = document.querySelector('a')!;
    const span = document.querySelector('span')!;
    const event = (target: Element) =>
      ({ target, currentTarget: document }) as never;

    assert.equal(eventMatches(event(link), '[data-link]'), link);
    assert.equal(eventMatches(event(span), '[data-link]'), link);
    assert.equal(eventMatches(event(document.body), '[data-link]'), undefined);
  });
});
