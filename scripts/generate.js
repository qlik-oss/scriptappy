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
    examples: {
      type: 'array',
      items: { type: 'string' },
    },
    type: { type: 'string' },
    name: { type: 'string' },
    optional: { type: 'boolean' },
    nullable: { type: 'boolean' },
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

const extendable = {
  properties: {
    extends: {
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
    implements: {
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
  },
};

const signature = {
  properties: {
    params: {
      type: 'array',
      items: {
        allOf: [{
          $ref: '#/definitions/entity-tier3',
        }],
      },
    },
    returns: {
      $ref: '#/definitions/entity-tier3',
    },
  },
  additionalProperties: false,
  required: ['params'],
};

schema.definitions.common = extend(true, {}, common, {});

function addTier(t) {
  const tier = `entity-tier${t}`;
  if (!schema.definitions[tier]) {
    schema.definitions[tier] = {
      type: 'object',
      oneOf: [],
    };
  }
  return schema.definitions[tier];
}

addTier(0);
addTier(1);
addTier(2);
addTier(3);
addTier(4);

function addToTier(ref, tier) {
  addTier(tier).oneOf.push({
    $ref: `#/definitions/${ref}`,
  });
}

(() => {
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
  addToTier('type', 3);
})();

// kinds

function entries(lowestTier) {
  const max = 3;
  const obj = {
    additionalProperties: {
      type: 'object',
      oneOf: [],
    },
  };
  for (let i = lowestTier; i <= max; i += 1) {
    obj.additionalProperties.oneOf.push({
      $ref: `#/definitions/entity-tier${i}`,
    });
  }
  return obj;
}

function entry(t) {
  return {
    additionalProperties: {
      $ref: `#/definitions/kind.${t}`,
    },
  };
}

function addKind(k, tier, ...props) {
  const entityProps = {
    type: 'object',
    properties: {},
    additionalProperties: false,
    patternProperties: {
      '^x-': {
        $ref: '#/definitions/vendor',
      },
    },
    required: ['kind'],
  };

  const def = extend(true, {
    type: 'object',
    properties: {
      kind: {
        const: k,
      },
    },
  }, entityProps, ...props);

  Object.keys(common.properties).forEach(key => { def.properties[key] = true; });

  schema.definitions[`kind.${k}`] = {
    allOf: [
      { $ref: '#/definitions/common' },
      def,
    ],
  };

  addToTier(`kind.${k}`, tier);
}

addKind('literal', 3, {
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

addKind('module', 0, {
  properties: {
    entries: entries(1),
    definitions: entries(1),
    events: entry('event'),
  },
});
addKind('object', 3, extendable, {
  properties: {
    entries: entries(3),
    definitions: entries(3),
    events: entry('event'),
  },
});
addKind('namespace', 1, {
  properties: {
    entries: entries(1),
    definitions: entries(1),
    events: entry('event'),
  },
});

addKind('function', 3, signature, {
  properties: {
    async: { type: 'boolean' },
    generator: { type: 'boolean' },
    yields: {
      type: 'array',
      items: { $ref: '#/definitions/entity-tier3' },
    },
    emits: {
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
    entries: entries(3),
    definitions: entries(3),
    events: entry('event'),
  },
  required: ['kind'],
});

addKind('class', 2, extendable, {
  properties: {
    constructor: signature,
    staticEntries: entries(3),
    entries: entries(3),
    definitions: entries(2),
    events: entry('event'),
  },
});

addKind('interface', 2, signature, extendable, {
  properties: {
    entries: entries(3),
    definitions: entries(2),
    events: entry('event'),
  },
  required: ['kind'],
});

addKind('event', 4, signature, {
  properties: {
    entries: entries(3),
    definitions: entries(3),
  },
  required: ['kind', 'params'],
});

addKind('array', 3, {
  properties: {
    items: {
      oneOf: [
        {
          type: 'array', // tuple
          items: { $ref: '#/definitions/entity-tier3' },
        },
        {
          $ref: '#/definitions/entity-tier3',
        },
      ],
    },
    definitions: entries(3),
  },
});

addKind('union', 3, {
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/definitions/entity-tier3' },
    },
    definitions: entries(3),
  },
});

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

const isValid = ajv.validateSchema(schema);

if (!isValid) {
  throw new Error('Invalid schema');
} else {
  const JSONSpec = JSON.stringify(schema, null, 2);
  fs.writeFileSync(`${__dirname}/../schema/schema.json`, JSONSpec);
}
