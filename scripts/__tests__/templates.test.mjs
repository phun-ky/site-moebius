import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../../src', import.meta.url));

describe('HTML templates in src', () => {
  // diff-dom, which renders the templates, ends the page at a closing tag
  // written as `</a` + newline + `>`, and Prettier writes long inline tags
  // that way. The page then silently loses everything after it
  it('never split a closing tag over lines', async () => {
    const files = (await readdir(SRC, { recursive: true })).filter(
      (file) => file.endsWith('.ts') && !file.includes('__tests__')
    );
    const split = [];

    for (const file of files) {
      const source = await readFile(join(SRC, file), 'utf8');

      for (const [line, text] of source.split('\n').entries()) {
        if (/<\/[a-z][a-z0-9]*\s*$/i.test(text))
          split.push(`${file}:${line + 1}`);
      }
    }

    assert.deepEqual(split, []);
  });
});
