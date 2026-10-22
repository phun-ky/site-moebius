// Give every route a file on GitHub Pages: copy dist/index.html to
// dist/<route>.html for each path in src/lib/spa/router/routes.ts, and to
// dist/404.html. Pages serves `/about` from `about.html`, and `404.html` with
// status 404 for anything else; the app reads the path and renders the page.
//
// Each file gets its page's title, description, canonical URL and social
// card from src/config/pages.json (#40), and the build gets a sitemap.xml
// and robots.txt.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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

// The pages.json entry for the not-found page; the router uses this path too
export const NOT_FOUND = '/404';

const TITLE = /<title>[^<]*<\/title>/;
const escapeAttribute = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

/**
 * The <title> and metadata tags for a page.
 * @param {typeof import('../src/config/pages.json')} config - pages.json.
 * @param {string} path - The page's path in pages.json, such as `/about`.
 * @returns {string} The tags.
 * @throws {RangeError} If pages.json has no entry for the path.
 */
export const pageHead = (config, path) => {
  const page = config.pages[path];

  if (!page) {
    throw new RangeError(`Add ${path} to src/config/pages.json`);
  }

  const { site, name, image } = config;
  const url = new URL(path, site).href;
  const meta = (attribute, key, content) =>
    `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`;

  return [
    `<title>${escapeAttribute(page.title)}</title>`,
    meta('name', 'description', page.description),
    // The not-found page is served at every unknown address, so it has no
    // address of its own to share, and search engines shouldn't list it
    ...(path === NOT_FOUND
      ? [meta('name', 'robots', 'noindex')]
      : [
          `<link rel="canonical" href="${escapeAttribute(url)}" />`,
          meta('property', 'og:url', url)
        ]),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', name),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:image', new URL(image.path, site).href),
    meta('property', 'og:image:width', image.width),
    meta('property', 'og:image:height', image.height),
    meta('property', 'og:image:alt', image.alt),
    meta('name', 'twitter:card', 'summary_large_image')
  ].join('\n    ');
};

/**
 * Put a page's metadata into the built index.html, in place of its <title>.
 * @param {string} html - dist/index.html.
 * @param {typeof import('../src/config/pages.json')} config - pages.json.
 * @param {string} path - The page's path in pages.json.
 * @returns {string} The page's HTML.
 * @throws {Error} If index.html has no <title>.
 */
export const withPageHead = (html, config, path) => {
  if (!TITLE.test(html)) {
    throw new Error('index.html needs a <title> for the page metadata');
  }

  return html.replace(TITLE, () => pageHead(config, path));
};

/**
 * A sitemap listing every page.
 * @param {string} site - The site's address.
 * @param {string[]} paths - The route paths.
 * @returns {string} sitemap.xml.
 */
export const sitemap = (site, paths) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map(
      (path) => `  <url><loc>${new URL(path, site).href}</loc></url>`
    ),
    '</urlset>',
    ''
  ].join('\n');

/**
 * robots.txt: everything may be crawled, and where the sitemap is.
 * @param {string} site - The site's address.
 * @returns {string} robots.txt.
 */
export const robots = (site) =>
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;

const main = async () => {
  const dist = join(ROOT, 'dist');
  const index = await readFile(join(dist, 'index.html'), 'utf8');
  const config = JSON.parse(
    await readFile(join(ROOT, 'src/config/pages.json'), 'utf8')
  );
  const paths = parseRoutePaths(
    await readFile(join(ROOT, 'src/lib/spa/router/routes.ts'), 'utf8')
  );
  const files = [
    ...paths.map((path) => [path, routeFile(path) ?? 'index.html']),
    [NOT_FOUND, '404.html']
  ];

  for (const [path, file] of files) {
    await mkdir(dirname(join(dist, file)), { recursive: true });
    await writeFile(join(dist, file), withPageHead(index, config, path));
  }

  await writeFile(join(dist, 'sitemap.xml'), sitemap(config.site, paths));
  await writeFile(join(dist, 'robots.txt'), robots(config.site));

  console.log(
    `Route files written: ${files.map(([, file]) => file).join(', ')}, sitemap.xml, robots.txt`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
