import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import styles from '@ironkinoko/rollup-plugin-styles';
import svg from 'rollup-plugin-svg-import';

export default {
  input: 'src/main.ts',
  // The site is loaded with a script tag, so the entry exports nothing; this
  // avoids an empty facade chunk
  preserveEntrySignatures: false,
  output: {
    format: 'es',
    // Source maps are written without a sourceMappingURL comment and moved
    // out of dist after the build (see postbuild): CI keeps them as an
    // artifact, the site doesn't serve them
    sourcemap: 'hidden',
    dir: 'dist',
    assetFileNames: '[name][extname]'
  },
  plugins: [
    nodeResolve(),
    commonjs({
      requireReturnsDefault: true
    }),
    json(),
    svg({
      // process SVG to DOM Node or String. Default: false
      stringify: true
    }),
    styles({
      mode: ['extract', './css/moebius-site.css'],
      url: false,
      minimize: true
    }),
    ts({
      sourceMap: false,
      typescript
    }),
    terser()
  ]
};
