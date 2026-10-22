import { defineConfig, type Plugin } from 'vite';

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { colorNameFiles } from './scripts/build-color-names.mjs';
import { readTokens, tokensToCss } from './scripts/build-tokens.mjs';

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
// The design tokens in tokens/ as CSS custom properties (#42), imported as
// 'virtual:moebius-tokens.css'. The dev server reloads when a token file
// changes.
const TOKENS_ID = 'virtual:moebius-tokens.css';
const designTokens = (): Plugin => ({
  name: 'moebius-design-tokens',
  resolveId(id) {
    return id === TOKENS_ID ? `\0${TOKENS_ID}` : undefined;
  },
  async load(id) {
    if (id !== `\0${TOKENS_ID}`) return undefined;

    const tokens = await readTokens();

    tokens.files.forEach((file) => this.addWatchFile(file));

    return tokensToCss(tokens);
  }
});
// Content Security Policy for the built site (#35). GitHub Pages can't send
// headers, so it goes into a <meta> tag, which can't use frame-ancestors or
// reporting. Only the build gets it: the dev server injects inline styles
// and a websocket. Style attributes stay allowed, because the templates and
// Prism's inline-color plugin write them; <style> elements and all inline
// scripts are blocked.
// Source keywords such as 'self' are quoted in a policy
const keyword = (name: string) => `'${name}'`;

export const CONTENT_SECURITY_POLICY = [
  `default-src ${keyword('self')}`,
  `script-src ${keyword('self')}`,
  `style-src ${keyword('self')}`,
  `style-src-attr ${keyword('unsafe-inline')}`,
  `img-src ${keyword('self')} data:`,
  `font-src ${keyword('self')}`,
  `connect-src ${keyword('self')}`,
  `object-src ${keyword('none')}`,
  `base-uri ${keyword('self')}`,
  `form-action ${keyword('none')}`,
  'upgrade-insecure-requests'
].join('; ');

const CHARSET = '<meta charset="utf-8" />';
const securityMeta = (): Plugin => ({
  name: 'moebius-security-meta',
  apply: 'build',
  // Right after the charset, before any script or stylesheet
  transformIndexHtml(html) {
    if (!html.includes(CHARSET)) {
      throw new Error(`index.html must start its <head> with ${CHARSET}`);
    }

    return html.replace(
      CHARSET,
      `${CHARSET}
    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />`
    );
  }
});

export default defineConfig({
  plugins: [colorNames(), designTokens(), securityMeta()],
  resolve: { alias },
  build: {
    target: 'es2024',
    // Written without a sourceMappingURL comment and moved out of dist after
    // the build: CI keeps them as an artifact, the site doesn't serve them
    sourcemap: 'hidden'
  }
});
