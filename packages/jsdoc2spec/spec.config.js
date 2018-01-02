module.exports = {
  api: {
    name: undefined,
    description: undefined,
    version: undefined,
    license: undefined,
  },
  output: {
    file: 'spec.json',
  },
  jsdoc: undefined,
  spec: {
    version: '',
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
      Object: {
        rewrite: 'object',
      },
      Array: {
        rewrite: 'array',
      },
      Promise: {},
      HTMLElement: {},
    },
    rules: {
      'type-unknown': 1,
    },
  },
};
