// Serve the built site the way GitHub Pages does, for the end-to-end tests:
// `node scripts/serve.mjs [port] [directory]`. The port defaults to 4173 and
// the directory to dist.
import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serve } from './lib/serve.mjs';

const [port = '4173', dir] = process.argv.slice(2);
const DIST = dir
  ? normalize(dir)
  : fileURLToPath(new URL('../dist', import.meta.url));

if (!existsSync(join(DIST, 'index.html'))) {
  throw new Error(
    `${join(DIST, 'index.html')} not found: run npm run build first`
  );
}

const server = await serve(DIST, Number(port));

console.log(`Serving ${DIST} at http://127.0.0.1:${server.address().port}`);
