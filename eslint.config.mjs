import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/esm/', '**/dist/', '**/coverage/', '**/node_modules/', '**/qext']),
  {
    extends: fixupConfigRules(compat.extends('airbnb-base', 'prettier', 'plugin:import/recommended')),
    plugins: {
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'import/extensions': 0,
      'import/no-extraneous-dependencies': [
        2,
        {
          devDependencies: true,
          peerDependencies: true,
        },
      ],
      'default-param-last': 0,
      'no-bitwise': 0,
      'no-console': 0,
      'no-plusplus': 0,
      'no-underscore-dangle': 0,
      'no-use-before-define': 0,
      'import/no-unresolved': ['error', { ignore: ['yargs/yargs'] }],
      'prefer-regex-literals': 0,
      'prettier/prettier': 2,
      'react/destructuring-assignment': [0, 'always'],
      'react/jsx-props-no-spreading': 0,
    },
  },
  {
    files: ['**/*.spec.js', '**/*.mock.js'],
    languageOptions: {
      globals: {
        ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, 'off'])),
        ...globals.node,
        ...globals.jest,
        chai: false,
        expect: false,
        jestExpect: false,
        sinon: false,
        page: false,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
      'no-unused-expressions': 0,
    },
  },
]);