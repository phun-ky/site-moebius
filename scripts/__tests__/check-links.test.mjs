import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { markdownLinks, slug } from '../check-links.mjs';

describe('slug', () => {
  it('makes the id GitHub gives a heading', () => {
    assert.equal(
      slug('Reporting a vulnerability'),
      'reporting-a-vulnerability'
    );
    assert.equal(slug('What `#options=` holds?'), 'what-options-holds');
    assert.equal(slug('moebius-site'), 'moebius-site');
  });
});

describe('markdownLinks', () => {
  const files = new Set(['README.md', 'docs/a.md', 'public/img/logo.png']);
  const exists = (path) => files.has(path);

  it('accepts links to files and headings that exist', () => {
    const text =
      '# Title\n\n[a](docs/a.md) ![logo](./public/img/logo.png) [t](#title)';

    assert.deepEqual(markdownLinks('README.md', text, exists).broken, []);
  });

  it('resolves links from the file they are in', () => {
    assert.deepEqual(
      markdownLinks('docs/a.md', '[r](../README.md#title)', exists).broken,
      []
    );
  });

  it('reports missing files and headings', () => {
    const text = '# Title\n\n![logo](./public/images/logo.svg) [x](#nope)';

    assert.deepEqual(markdownLinks('README.md', text, exists).broken, [
      'README.md: ./public/images/logo.svg does not exist',
      'README.md: no heading for #nope'
    ]);
  });

  it('lists links to other hosts without checking them', () => {
    const text = '[a](https://example.com/a) [m](mailto:me@example.com)';

    assert.deepEqual(markdownLinks('README.md', text, exists), {
      broken: [],
      external: ['https://example.com/a']
    });
  });
});
