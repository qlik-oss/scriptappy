#!/usr/bin/env node

const fs = require('fs');
const extend = require('extend');
const Ajv = require('ajv');
const schema = require('./partial.json');

const common = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    stability: { $ref: '#/definitions/stability' },
    availability: { $ref: '#/definitions/availability' },
    name: { type: 'string' },
    type: { type: 'string' },
    optional: { type: 'boolean' },
    nullable: { type: 'boolean' },
    examples: {
      type: 'array',
      items: { type: 'string' },
    },
    defaultValue: {
      oneOf: [
        { type: 'number' },
        { type: 'boolean' },
        { type: 'string' },
      ],
    },
  },
  patternProperties: {
    '^x-': {
      $ref: '#/definitions/vendor',
    },
  },
};

const signature = {
  properties: {
    params: {
      type: 'array',
      items: {
        allOf: [{
          $ref: '#/definitions/entity',
        }],
      },
    },
    returns: {
      $ref: '#/definitions/entity',
    },
  },
  additionalProperties: false,
  required: ['params'],
};

schema.definitions.kind = {
  type: 'object',
  properties: {
    extends: {
      type: 'array',
      items: {
        $ref: '#/definitions/entity',
      },
    },
    implements: {
      type: 'array',
      items: {
        $ref: '#/definitions/entity',
      },
    },
    entries: {
      $ref: '#/definitions/entry',
    },
    definitions: {
      $ref: '#/definitions/entry',
    },
    events: {
      $ref: '#/definitions/entry',
    },
  },
};

schema.definitions.common = extend(true, {}, common, {});

// schema.definitions.entity.oneOf = [];

function type() {
  const def = extend(true, {
    type: 'object',
    properties: {
      type: {
        type: 'string',
      },
    },
    required: ['type'],
    not: {
      required: ['kind'],
    },
    additionalProperties: false,
  });

  Object.keys(common.properties).forEach(key => { def.properties[key] = true; });

  schema.definitions.type = {
    allOf: [
      { $ref: '#/definitions/common' },
      def,
    ],
  };

  schema.definitions.entity.oneOf.push({
    $ref: '#/definitions/type',
  });
}

type();

function addKind(k, ...props) {
  const def = extend(true, {
    type: 'object',
    properties: {
      kind: {
        const: k,
      },
    },
    additionalProperties: false,
    patternProperties: {
      '^x-': {
        $ref: '#/definitions/vendor',
      },
    },
    required: ['kind'],
  }, ...props);

  Object.keys(common.properties).forEach(key => { def.properties[key] = true; });
  Object.keys(schema.definitions.kind.properties).forEach(key => { def.properties[key] = true; });

  schema.definitions[`kind.${k}`] = {
    allOf: [
      { $ref: '#/definitions/common' },
      { $ref: '#/definitions/kind' },
      def,
    ],
  };

  schema.definitions.entity.oneOf.push({
    $ref: `#/definitions/kind.${k}`,
  });
}

addKind('literal', {
  properties: {
    value: {
      oneOf: [
        { type: 'number' },
        { type: 'boolean' },
        { type: 'string' },
      ],
    },
  },
  required: ['kind', 'value'],
});
addKind('module');

addKind('function', signature, {
  properties: {
    async: { type: 'boolean' },
    generator: { type: 'boolean' },
    yields: {
      $ref: '#/definitions/entity',
    },
    emits: {
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
  },
  required: ['kind'],
});

addKind('object');
addKind('struct');

addKind('class', {
  properties: {
    constructor: signature,
    staticEntries: {
      $ref: '#/definitions/entry',
    },
  },
});
addKind('interface', signature);
addKind('event', signature, {
  required: ['kind', 'params'],
});

addKind('array', {
  properties: {
    items: {
      oneOf: [
        {
          type: 'array', // tuple
          items: { $ref: '#/definitions/entity' },
        },
        {
          $ref: '#/definitions/entity',
        },
      ],
    },
  },
});

addKind('union', {
  properties: {
    items: {
      oneOf: [
        {
          type: 'array', // tuple
          items: { $ref: '#/definitions/entity' },
        },
        {
          $ref: '#/definitions/entity',
        },
      ],
    },
  },
});

const ajv = new Ajv({
  allErrors: true,
  verbose: true
});

const isValid = ajv.validateSchema(schema);

if (!isValid) {
  throw new Error("Invalid schema");
} else {
  const JSONSpec = JSON.stringify(schema, null, 2);
  fs.writeFileSync(`${__dirname}/../schema/schema.json`, JSONSpec);
  console.log("Generated schema!");
}
