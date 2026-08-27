import { jest, recommended } from '@qlik/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [recommended, jest],
  // no tsconfig.json / TypeScript anywhere in this project — without a real TS project to check
  // against, the type-aware engine can misparse plain .js files (JSDoc blocks, etc.)
  options: { typeAware: false, typeCheck: false },
  env: { node: true },
  ignorePatterns: ['**/esm/', '**/dist/', '**/coverage/', '**/node_modules/'],
  overrides: [
    {
      // Rule severities are set here (as an override), not in root `rules`, since a few rules
      // are also touched by the jest preset and root `rules` values for those are silently
      // discarded by the preset merge.
      files: ['**/*.js'],
      rules: {
        // ported from the old eslint.config.mjs (airbnb-base defaults these on, old config turned them off)
        'default-param-last': 'off',
        'no-bitwise': 'off',
        'no-console': 'off',
        'no-plusplus': 'off',
        'no-underscore-dangle': 'off',
        'no-use-before-define': 'off',
        'prefer-regex-literals': 'off',
        'import/extensions': 'off',

        // new oxlint-native rules with no prior ESLint equivalent — downgraded to keep this
        // migration a pure tooling swap
        'no-unassigned-vars': 'warn',
        'no-useless-assignment': 'warn',
        'typescript/no-dynamic-delete': 'warn',
        'import/no-named-as-default-member': 'warn',
        'unicorn/prefer-string-starts-ends-with': 'warn',
        'unicorn/no-array-sort': 'warn',
        'unicorn/no-array-reverse': 'warn',
        'unicorn/no-useless-spread': 'warn',
        'prefer-object-has-own': 'warn',
        'preserve-caught-error': 'warn',
      },
    },
    {
      files: ['**/*.spec.js', '**/*.mock.js'],
      env: { builtin: true, node: true, jest: true },
      globals: {
        chai: 'readonly',
        expect: 'readonly',
        jestExpect: 'readonly',
        sinon: 'readonly',
        page: 'readonly',
      },
      rules: {
        'no-unused-expressions': 'off',

        // tests use Chai's expect() (chai/sinon-chai), not Jest's own expect API — valid-expect
        // can never pass against Chai's chained matchers, and the import checks don't understand
        // jest.mock()-augmented namespaces used in tests
        'jest/valid-expect': 'off',
        'import/namespace': 'off',
        'import/default': 'off',

        // new oxlint-native rules with no prior ESLint equivalent — downgraded to keep this
        // migration a pure tooling swap
        'jest/expect-expect': 'warn',
        'jest/valid-title': 'warn',
      },
    },
  ],
});
