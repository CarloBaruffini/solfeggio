import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Layering rule (see docs/architecture.md):
 *   core  <-  audio / input / notation  <-  components / features  <-  app
 * A module may only import from layers to its left.
 */
const modules = (...names) => names.flatMap((name) => [`@/${name}`, `@/${name}/**`]);

const layerRestriction = (forbidden, message) => ({
  'no-restricted-imports': ['error', { patterns: [{ group: forbidden, message }] }],
});

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'coverage', 'playwright-report', 'test-results', 'legacy']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  {
    files: ['src/core/**'],
    rules: layerRestriction(
      [
        'react',
        'react/**',
        'react-*',
        'vexflow',
        'vexflow/**',
        'zustand',
        'zustand/**',
        ...modules('audio', 'input', 'notation', 'components', 'features', 'app', 'i18n', 'styles'),
      ],
      'core/ is framework-agnostic: it may only import from core/.',
    ),
  },
  {
    files: ['src/audio/**', 'src/input/**', 'src/notation/**'],
    rules: layerRestriction(
      [...modules('components', 'features', 'app'), 'zustand', 'zustand/**'],
      'audio/, input/ and notation/ may only import from core/ (and their own layer).',
    ),
  },
  {
    files: ['src/components/**'],
    rules: layerRestriction(
      [...modules('features', 'app'), 'zustand', 'zustand/**'],
      'components/ are presentational: they must not depend on features/, app/ or stores.',
    ),
  },
  {
    files: ['src/features/**'],
    rules: layerRestriction(modules('app'), 'features/ must not depend on app/.'),
  },

  {
    files: ['*.config.{js,ts}', 'e2e/**'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  prettier,
]);
