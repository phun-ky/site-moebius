// Check what the build ships in dist (#29): no source maps or references to
// them, no leftover test files, and minified JavaScript. Run after `npm run
// build`, or pass a built site's directory.
import { minify } from 'terser';

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = process.argv[2]
  ? normalize(process.argv[2])
  : fileURLToPath(new URL('../dist', import.meta.url));
// Minifying an already minified file again saves almost nothing (under 1%);
// an unminified chunk shrinks to about half its size or less
const MAX_REMINIFY_SAVING = 0.1;
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    return statSync(path).isDirectory() ? walk(path) : [path];
  });

/**
 * Find what should not be in dist.
 * @param {string} dist - The built site.
 * @returns {Promise<string[]>} One message per problem.
 */
export const findProblems = async (dist) => {
  const problems = [];

  for (const file of walk(dist)) {
    const name = relative(dist, file);

    if (name.endsWith('.map')) {
      problems.push(`${name}: source map in dist`);
      continue;
    }

    if (name.endsWith('dummy.js')) {
      problems.push(`${name}: leftover test file`);
    }

    if (!/\.(js|css)$/.test(name)) continue;

    const text = readFileSync(file, 'utf8');

    if (/[#@] sourceMappingURL=/.test(text)) {
      problems.push(`${name}: points to a source map`);
    }

    if (name.endsWith('.js') && text.length > 1024) {
      const { code } = await minify(text, { module: true });
      const saving = 1 - code.length / text.length;

      if (saving > MAX_REMINIFY_SAVING) {
        problems.push(
          `${name}: not minified (minifying it saves ${Math.round(
            saving * 100
          )}%)`
        );
      }
    }
  }

  return problems;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = await findProblems(DIST);

  for (const problem of problems) console.error(`FAIL ${problem}`);

  if (problems.length > 0) {
    process.exitCode = 1;
  } else {
    console.log(
      `ok   ${
        walk(DIST).length
      } files in dist, no source maps, JavaScript minified`
    );
  }
}
