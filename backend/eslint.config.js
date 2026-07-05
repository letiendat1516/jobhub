import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/**
 * ESLint flat config (v9+).
 * Project rules per docs/07_AI_AGENT_RULES.md (Clean Code, no debug logs).
 */
export default [
  {
    ignores: ['node_modules/', 'coverage/', 'dist/'],
  },
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        // Vitest (Jest-compatible) globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  },
];
