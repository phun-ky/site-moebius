// Give every route a file on GitHub Pages: copy dist/index.html to
// dist/<route>.html for each path in src/lib/spa/router/routes.ts, and to
// dist/404.html. Pages serves `/about` from `about.html`, and `404.html` with
// status 404 for anything else; the app reads the path and renders the page.
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ROUTE_PATH = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;

/**
 * Read the route paths from routes.ts.
 * @param {string} source - The contents of routes.ts.
 * @returns {string[]} The paths, such as `['/', '/about']`.
 * @throws {RangeError} If no paths are found.
 */
export const parseRoutePaths = (source) => {
  const paths = [...source.matchAll(/\bpath:\s*'([^']*)'/g)].map(
    ([, path]) => path
  );

  if (paths.length === 0) {
    throw new RangeError('No route paths found in routes.ts');
  }

  return paths;
};

/**
 * The file a route is served from, relative to dist.
 * @param {string} path - A route path such as `/about`.
 * @returns {string | null} `about.html`, or null for `/` (index.html).
 * @throws {TypeError} If the path has characters a file name shouldn't.
 */
export const routeFile = (path) => {
  if (path === '/') {
    return null;
  }

  if (!ROUTE_PATH.test(path)) {
    throw new TypeError(
      `Route path can't become a file: ${JSON.stringify(path)}`
    );
  }

  return `${path.slice(1)}.html`;
};

const main = async () => {
  const dist = join(ROOT, 'dist');
  const index = join(dist, 'index.html');
  const source = await readFile(
    join(ROOT, 'src/lib/spa/router/routes.ts'),
    'utf8'
  );
  const files = [
    ...parseRoutePaths(source).map(routeFile).filter(Boolean),
    '404.html'
  ];

  for (const file of files) {
    await mkdir(dirname(join(dist, file)), { recursive: true });
    await copyFile(index, join(dist, file));
  }

  console.log(`Route files written: ${files.join(', ')}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
