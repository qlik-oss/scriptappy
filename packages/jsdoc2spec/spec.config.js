module.exports = {
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
  },
  rules: {
    'type-unknown': 1,
  },
};
