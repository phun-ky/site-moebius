import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { stringToObj } from 'diff-dom';
import fc from 'fast-check';

import { escapeAttribute, escapeText } from '../escape';

const PAYLOAD = '"><img src=x onerror="alert(1)">';
// Parse the way the SPA does (lib/spa/utils/update-nodes.ts)
const parse = (html: string) =>
  stringToObj(`<div class="ph app project">${html}</div>`) as {
    childNodes: {
      nodeName: string;
      attributes?: Record<string, string>;
      childNodes?: { nodeName: string; data?: string }[];
    }[];
  };

describe('escapeText', () => {
  it('keeps markup as text in diff-dom', () => {
    const [code] = parse(`<code>${escapeText(PAYLOAD)}</code>`).childNodes;

    assert.equal(code.nodeName, 'CODE');
    assert.deepEqual(code.childNodes, [{ nodeName: '#text', data: PAYLOAD }]);
  });

  it('turns null and undefined into an empty string', () => {
    assert.equal(escapeText(undefined), '');
    assert.equal(escapeText(null), '');
  });

  it('round-trips any string through diff-dom as a single text node', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (value) => {
        const [code] = parse(`<code>${escapeText(value)}</code>`).childNodes;

        assert.deepEqual(code.childNodes, [{ nodeName: '#text', data: value }]);
      }),
      { numRuns: 2000 }
    );
  });
});

describe('escapeAttribute', () => {
  it('cannot end the attribute or the tag', () => {
    const [div] = parse(
      `<div data-color-name="${escapeAttribute(PAYLOAD)}"></div>`
    ).childNodes;

    assert.deepEqual(Object.keys(div.attributes ?? {}), ['data-color-name']);
    assert.equal(div.childNodes?.length ?? 0, 0);
  });

  it('keeps ordinary colour names as they are', () => {
    for (const name of [
      'Maniac Mansion',
      'The Count’s Black',
      "Pink 'n' Blue",
      'Black & White',
    ]) {
      const [div] = parse(
        `<div data-color-name="${escapeAttribute(name)}"></div>`
      ).childNodes;

      assert.equal(div.attributes?.['data-color-name'], name);
    }
  });

  it('gives exactly one attribute and no child nodes, for any string', () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const html = `<div data-color-name="${escapeAttribute(
          value
        )}"></div><p>after</p>`;
        const [div, p] = parse(html).childNodes;

        assert.deepEqual(Object.keys(div.attributes ?? {}), [
          'data-color-name',
        ]);
        assert.equal(div.childNodes?.length ?? 0, 0);
        assert.equal(p?.nodeName, 'P');
      }),
      { numRuns: 2000 }
    );
  });
});
