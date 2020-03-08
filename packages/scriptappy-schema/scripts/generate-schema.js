#!/usr/bin/env node

const fs = require('fs');
const extend = require('extend');
const Ajv = require('ajv');
const schema = require('./partial.json');
const pkg = require('../package.json');

const common = {
  type: 'object',
  properties: {
    description: { type: 'string', description: 'A description of the entity.' },
    stability: { $ref: '#/definitions/stability', description: 'The stability of the entity.' },
    availability: { $ref: '#/definitions/availability', description: 'The availability of the entity.' },
    examples: {
      description: 'Examples showing how to use this entity.',
      type: 'array',
      items: { type: 'string' },
    },
    type: { type: 'string', description: 'The type of this entity.' },
    name: { type: 'string', description: 'Name of this entity.' },
    optional: {
      type: 'boolean',
      description:
        'Optionality of this entity. Used to indicate when the entity is optional as a method parameter or an object entry.',
    },
    nullable: {
      type: 'boolean',
      description:
        'Nullability of this entity. Used to indicate when the entity is nullable as a method parameter or an object entry.',
    },
    variable: {
      type: 'boolean',
      description: 'Variability of this entity. Used to indicate when the entity is repeatable as a method parameter.',
    },
    generics: {
      type: 'array',
      description: 'Generic types.',
      items: {
        allOf: [{ $ref: '#/definitions/entity-tier3' }],
      },
    },
    defaultValue: {
      description: 'Default value for this entity. Used when the entity is optional.',
      oneOf: [{ type: 'number' }, { type: 'boolean' }, { type: 'string' }],
    },
    templates: {
      description: 'The generic templates for this entity.',
      type: 'array',
      items: {
        oneOf: [
          {
            $ref: '#/definitions/named',
          },
          {
            $ref: '#/definitions/entity-tier3',
          },
        ],
      },
    },
  },
  patternProperties: {
    '^x-': {
      $ref: '#/definitions/vendor',
    },
  },
  examples: [
    `
  "type": "number"
  "description": "Get the current amount",
  "stability": "stable",
  "availability": {
    "since": "1.1.0"
  },
  "optional": true,
  "defaultValue": 13
`,
  ],
};

const extendable = {
  properties: {
    extends: {
      description: 'References to other entities this entity extends from.',
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
    implements: {
      description: 'References to other entities this entity implements.',
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
      description: 'The parameters for this entity.',
      type: 'array',
      items: {
        allOf: [
          {
            $ref: '#/definitions/entity-tier3',
          },
        ],
      },
    },
    returns: {
      description: 'The return type from this entity.',
      $ref: '#/definitions/entity-tier3',
    },
    this: {
      description: 'The value of `this`.',
      $ref: '#/definitions/entity-tier3',
    },
  },
  additionalProperties: false,
  required: ['params'],
};

schema.definitions.common = extend(true, {}, common, {});
schema.properties.scriptappy.const = pkg.version;

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
    patternProperties: {
      '^x-': {
        $ref: '#/definitions/vendor',
      },
    },
  });

  Object.keys(common.properties).forEach(key => {
    // if (key === 'templates') {
    //   return;
    // }
    def.properties[key] = true;
  });

  schema.definitions.type = {
    allOf: [{ $ref: '#/definitions/common' }, def],
  };
  addToTier('type', 3);

  schema.definitions.named = {
    allOf: [
      { $ref: '#/definitions/common' },
      extend({}, def, {
        required: ['name'],
        not: {
          required: ['type'],
        },
        properties: {
          description: true,
          stability: true,
          availability: true,
          examples: true,
          name: true,
          generics: true,
          defaultValue: true,
        },
      }),
    ],
  };
})();

// kinds

function entries(lowestTier) {
  const max = 3;
  const obj = {
    additionalProperties: {
      type: 'object',
      oneOf: [],
    },
    description: 'An object.',
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
    description: 'An object.',
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

  const def = extend(
    true,
    {
      type: 'object',
      properties: {
        kind: {
          const: k,
        },
      },
    },
    entityProps,
    ...props
  );

  const { examples } = def;
  delete def.examples;

  Object.keys(common.properties).forEach(key => {
    if (key === 'templates' && !['class', 'function', 'interface', 'object', 'alias'].includes(k)) {
      return;
    }
    def.properties[key] = true;
  });

  schema.definitions[`kind.${k}`] = {
    allOf: [{ $ref: '#/definitions/common' }, def],
    examples,
  };

  addToTier(`kind.${k}`, tier);
}

addKind('alias', 2, {
  properties: {
    items: {
      $ref: '#/definitions/entity-tier3',
    },
  },
  required: ['kind', 'items'],
  examples: [
    `
  "kind": "alias",
  "items": {
    "kind": "union",
    "items": [{ "type": "string" }, { "type": "number" }]
  }
`,
  ],
});

addKind('literal', 3, {
  properties: {
    value: {
      oneOf: [{ type: 'number' }, { type: 'boolean' }, { type: 'string' }],
    },
  },
  required: ['kind', 'value'],
  examples: [
    `
  "kind": "literal",
  "value": 13
`,
  ],
});

addKind('module', 0, {
  properties: {
    entries: entries(1),
    definitions: entries(1),
    events: entry('event'),
  },
  examples: [
    `
  "kind": "module",
  "entries": {
    "a": { /* entity */ },
    "b": { /* entity */ }
  }
`,
  ],
});
addKind('object', 3, extendable, {
  properties: {
    entries: entries(3),
    definitions: entries(3),
    events: entry('event'),
  },
  examples: [
    `
  "kind": "object",
  "entries": {
    "prop": { /* entity */ }
  }
`,
  ],
});
addKind('namespace', 1, {
  properties: {
    entries: entries(1),
    definitions: entries(1),
    events: entry('event'),
  },
  examples: [
    `
  "kind": "namespace",
  "entries": {
    "subspace": { /* entity */ }
  }
`,
  ],
});

addKind('function', 3, signature, {
  properties: {
    async: { type: 'boolean', description: 'Indicates whether this function is asynchronous.' },
    // generator: { type: 'boolean' },
    yields: {
      description: 'The entities this function yields.',
      type: 'array',
      items: { $ref: '#/definitions/entity-tier3' },
    },
    emits: {
      description: 'The events this entity emits.',
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
    throws: {
      description: 'The errors this entity throws.',
      type: 'array',
      items: {
        $ref: '#/definitions/type',
      },
    },
    entries: entries(3),
    definitions: entries(3),
    events: entry('event'),
  },
  required: ['kind', 'params'],
  examples: [
    `
  "kind": "function",
  "params": [{
    "name": "first"
    "type": "string",
    "optional": true,
    "variable": true
  }],
  "returns": {
    "type": "Promise<number>"
  },
  "async": true
`,
  ],
});

function constr() {
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

  const def = extend(
    true,
    {
      type: 'object',
      properties: {
        kind: {
          const: 'function',
        },
        params: {
          description: 'The parameters for this entity.',
          type: 'array',
          items: {
            allOf: [
              {
                $ref: '#/definitions/entity-tier3',
              },
            ],
          },
        },
      },
    },
    entityProps
  );

  Object.keys(common.properties).forEach(key => {
    if (key === 'templates') {
      return;
    }
    def.properties[key] = true;
  });

  schema.definitions.constructor = {
    allOf: [{ $ref: '#/definitions/common' }, def],
  };

  return def;
}

addKind('class', 2, extendable, {
  properties: {
    constructor: {
      $ref: '#/definitions/constructor',
    },
    staticEntries: entries(3),
    entries: entries(3),
    definitions: entries(2),
    events: entry('event'),
  },
  examples: [
    `
  "kind": "class",
  "constructor": {
    "params": []
  },
  "staticEntries": {
    "fun": { /* entity */ }
  }
`,
  ],
});

constr();

addKind('interface', 2, signature, extendable, {
  properties: {
    entries: entries(3),
    definitions: entries(2),
    events: entry('event'),
  },
  required: ['kind'],
  examples: [
    `
  "kind": "interface",
  "entries": {
    "a": { /* entity */ }
  }
`,
  ],
});

addKind('event', 4, signature, {
  properties: {
    entries: entries(3),
    definitions: entries(3),
  },
  required: ['kind'],
  examples: [
    `
  "kind": "event",
  "params": []
`,
  ],
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
  examples: [
    `
  "kind": "array",
  "items": { /* entity */ } // all values in array are of same type
`,
    `
  "kind": "array",
  "items": [ {/* entity */ }, { /* entity */ }] // tuple
`,
  ],
});

addKind('union', 3, {
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/definitions/entity-tier3' },
    },
    definitions: entries(3),
  },
  examples: [
    `
  "kind": "union",
  "items": [{ /* entity */ }, { /* entity */ }]
`,
  ],
});

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const isValid = ajv.validateSchema(schema);

if (!isValid) {
  throw new Error('Invalid schema');
} else {
  const JSONSpec = JSON.stringify(schema, null, 2);
  fs.writeFileSync(`${__dirname}/../schema.json`, JSONSpec);
}
