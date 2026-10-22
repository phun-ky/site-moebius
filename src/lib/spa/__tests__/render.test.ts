import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import globalJsdom from 'global-jsdom';

globalJsdom('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'https://moebius.wtf/'
});

// Node has its own CustomEvent, which jsdom's dispatchEvent rejects
globalThis.CustomEvent = window.CustomEvent;

const { init } = await import('..');

const details = (name: string) =>
  ({
    page: { route: { name } },
    routeChanged: true
  }) as unknown as Parameters<typeof init>[1];

describe('render', () => {
  it('keeps the newest page when an older render finishes last', async () => {
    let finishStart: (html: string) => void = () => {};
    const template = (page: { route: { name: string } }) =>
      page.route.name === 'Start'
        ? new Promise<string>((resolve) => (finishStart = resolve))
        : '<h1>About</h1>';

    // The start page waits, the visitor goes to the about page meanwhile
    const start = init(template, details('Start'));

    await init(template, details('About'));
    finishStart('<h1>Start</h1>');
    await start;

    assert.equal(document.body.querySelector('h1')?.textContent, 'About');
  });
});
