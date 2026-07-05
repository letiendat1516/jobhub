import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/**
 * ESLint flat config (v9+) for the React frontend.
 *
 * We import only the *rules* from eslint-plugin-react's recommended
 * config and supply `languageOptions` ourselves, because the plugin's
 * legacy recommended object is not flat-config compatible (it ships a
 * top-level `parserOptions`). Enforces functional components, hooks
 * rules, and clean code (docs/07_AI_AGENT_RULES.md §10).
 */
export default [
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  prettierConfig,
];
