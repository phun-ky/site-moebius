// Convert color-name-list's data into the name-to-hex map that
// Moebius({ colorNames }) accepts, and write it with the list's licence next
// to the built site (the colorNames plugin in vite.config.ts serves it in
// development and emits it in the build). The site serves it from its own
// origin instead of fetching names from a third party. Dependabot keeps
// color-name-list current.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { colornames } from 'color-name-list';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Turn color-name-list entries into a map of name to lowercase hex.
 * @param {unknown} entries - color-name-list's `colornames` export, an array
 *   of `{ name, hex }`.
 * @returns {Record<string, string>} The map, without a prototype.
 * @throws {TypeError} If the data is not an array of `{ name, hex }` with
 *   `#rrggbb` values.
 * @throws {RangeError} If a name appears twice, or there are no entries.
 */
export const toColorNameMap = (entries) => {
  if (!Array.isArray(entries)) {
    throw new TypeError(
      'color-name-list data must be an array of { name, hex }'
    );
  }

  if (entries.length === 0) {
    throw new RangeError('color-name-list data has no colors');
  }

  const map = Object.create(null);

  for (const entry of entries) {
    const { name, hex } = entry ?? {};

    if (
      typeof name !== 'string' ||
      name === '' ||
      typeof hex !== 'string' ||
      !HEX_COLOR.test(hex)
    ) {
      throw new TypeError(
        `Unexpected color-name-list entry: ${JSON.stringify(entry)}`
      );
    }

    if (Object.prototype.hasOwnProperty.call(map, name)) {
      throw new RangeError(`Duplicate color name in color-name-list: ${name}`);
    }

    map[name] = hex.toLowerCase();
  }

  return map;
};

/**
 * Build the files the site serves under /data from the installed
 * color-name-list.
 * @returns {Promise<{ version: string, count: number, files: Record<string, string> }>}
 *   The package version, the number of names, and each file's contents by
 *   its path under /data.
 */
export const colorNameFiles = async () => {
  const require = createRequire(import.meta.url);
  const packageDir = dirname(require.resolve('color-name-list/package.json'));
  const { version } = JSON.parse(
    await readFile(join(packageDir, 'package.json'), 'utf8')
  );
  const map = toColorNameMap(colornames);

  return {
    version,
    count: Object.keys(map).length,
    files: {
      'colornames.json': JSON.stringify(map),
      'colornames.LICENSE.txt': await readFile(
        join(packageDir, 'LICENSE'),
        'utf8'
      ),
    },
  };
};
