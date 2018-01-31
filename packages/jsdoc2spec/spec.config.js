module.exports = {
  api: {
    name: undefined,
    description: undefined,
    version: undefined,
    license: undefined,
    stability: undefined,
  },
  output: {
    file: 'spec.json',
  },
  jsdoc: undefined,
  spec: {
    version: '',
    validate: true,
  },
  parse: {
    types: {
      String: {
        rewrite: 'string',
      },
      Number: {
        rewrite: 'number',
      },
      Boolean: {
        rewrite: 'boolean',
      },
    },
    rules: {
      'no-unknown-types': 1,
      'no-missing-types': 1,
      'no-multi-return': 1,
      'no-unknown-stability': 2,
      'no-duplicate-references': 1,
      'no-untreated-kinds': 1,
      'no-default-exports-wo-name': 1,
    },
  },
};
