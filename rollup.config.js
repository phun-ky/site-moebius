import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import typescript from 'typescript';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import styles from '@ironkinoko/rollup-plugin-styles';
import svg from 'rollup-plugin-svg-import';

export default [
  {
    input: 'src/main.ts',
    output: {
      format: 'es',
      sourcemap: true,
      exports: 'named',
      dir: 'dist',
      assetFileNames: '[name][extname]'
    },
    plugins: [
      nodeResolve(),
      json(),
      commonjs({
        requireReturnsDefault: true
      }),
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
        useTsconfigDeclarationDir: true,
        sourceMap: false,
        typescript
      }),
      terser()
    ]
  },
  {
    input: './dts/main.d.ts',
    output: [{ file: './moebius-site.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];
