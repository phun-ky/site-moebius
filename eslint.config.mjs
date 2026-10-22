import markdown from '@eslint/markdown';
import { defineConfig, globalIgnores } from 'eslint/config';
import customConfig from 'eslint-config-phun-ky';
import globals from 'globals';
import { parser as TSEslintParser } from 'typescript-eslint';

export default defineConfig([
  // Build output
  globalIgnores(['dist/**', 'sourcemaps/**', 'coverage/**', 'test-results/**']),
  {
    extends: [customConfig],
    rules: {
      'import/no-unused-modules': 'off',
      // Vite plugins make modules such as 'virtual:moebius-tokens.css'
      'import-x/no-unresolved': ['error', { ignore: ['^virtual:'] }]
    }
  },
  {
    files: ['scripts/**/*.mjs', 'scripts/**/*.mts', 'vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      // Command-line scripts report to the terminal
      'no-console': 'off',
      // Runs in Node, not in the browsers in .browserslistrc
      'compat/compat': 'off'
    }
  },
  {
    // Playwright runs these in Node; the callbacks given to page.evaluate run
    // in the page
    files: ['e2e/**/*.mjs', 'playwright.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'compat/compat': 'off'
    }
  },
  {
    files: ['**/*.d.mts'],
    languageOptions: {
      parser: TSEslintParser
    }
  },
  {
    // Runs in the browser before the app, as a classic script
    files: ['public/js/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['**/*.md'],
    processor: markdown.processors.markdown,
    rules: {
      'no-irregular-whitespace': 'off',
      '@stylistic/indent': 'off'
    }
  },
  {
    files: ['**/*.md/*.js', '**/*.md/*.jsx', '**/*.md/*.ts', '**/*.md/*.tsx'],
    languageOptions: {
      parser: TSEslintParser,
      parserOptions: {
        project: false,
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'import/no-unresolved': 'off',
      '@stylistic/indent': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
      '@stylistic/semi': 'off',
      'no-console': 'off'
    }
  }
]);
