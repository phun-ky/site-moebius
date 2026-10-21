import { defineConfig, type Plugin } from 'vite';

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { colorNameFiles } from './scripts/build-color-names.mjs';

const src = fileURLToPath(new URL('./src', import.meta.url));
// Code imports from src without a relative path, such as 'utils/escape';
// each top-level directory of src is an alias (tsconfig.json has the same
// paths for TypeScript and tsx)
const alias = readdirSync(src, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => ({
    find: new RegExp(`^${name}(?=/|$)`),
    replacement: `${src}/${name}`
  }));
// Serve /data/colornames.json and its licence in development, and write them
// into dist/data in the build, from the installed color-name-list
const colorNames = (): Plugin => ({
  name: 'moebius-color-names',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const match = req.url?.match(/^\/data\/([\w.-]+)$/);
      const { files } = await colorNameFiles();
      const body = match ? files[match[1]] : undefined;

      if (body === undefined) return next();

      res.setHeader(
        'content-type',
        match![1].endsWith('.json') ? 'application/json' : 'text/plain'
      );
      res.end(body);
    });
  },
  async generateBundle() {
    const { version, count, files } = await colorNameFiles();

    for (const [name, source] of Object.entries(files)) {
      this.emitFile({
        type: 'asset',
        fileName: `data/${name}`,
        source: String(source)
      });
    }

    this.info(
      `color-name-list ${version}: ${count} names in data/colornames.json`
    );
  }
});

export default defineConfig({
  plugins: [colorNames()],
  resolve: { alias },
  build: {
    target: 'es2024',
    // Written without a sourceMappingURL comment and moved out of dist after
    // the build: CI keeps them as an artifact, the site doesn't serve them
    sourcemap: 'hidden'
  }
});
