// A static file server that behaves like GitHub Pages for the built site:
// `/about` serves `about.html`, a directory serves its `index.html`, and an
// unknown path gets `404.html` with status 404.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json'
};
const isFile = (file) => existsSync(file) && statSync(file).isFile();

/**
 * Serve a directory on a free port on 127.0.0.1.
 * @param {string} root - The directory to serve.
 * @returns {Promise<import('node:http').Server>} The listening server.
 */
export const serve = (root) =>
  new Promise((resolve) => {
    const server = createServer((req, res) => {
      const pathname = decodeURIComponent(
        new URL(req.url, 'http://x').pathname
      );
      const base = normalize(join(root, pathname));

      if (!base.startsWith(root)) {
        res.writeHead(403).end();

        return;
      }

      const file = [base, join(base, 'index.html'), `${base}.html`].find(
        isFile
      );
      const notFound = join(root, '404.html');

      if (!file && !isFile(notFound)) {
        res.writeHead(404).end();

        return;
      }

      res.writeHead(file ? 200 : 404, {
        'content-type':
          TYPES[extname(file ?? notFound)] ?? 'application/octet-stream'
      });
      createReadStream(file ?? notFound).pipe(res);
    });

    server.listen(0, '127.0.0.1', () => resolve(server));
  });
