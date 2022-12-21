const Ajv = require('ajv');
const extend = require('extend');
const schema6 = require('ajv/lib/refs/json-schema-draft-06.json');
const vv = require('scriptappy-tools');

const schema = require('../schema.json');
const pkg = require('../package.json');

const validKinds = {
  function: {
    kind: 'function',
    params: [],
  },
  class: {
    kind: 'class',
    constructor: {
      kind: 'function',
      params: [],
    },
  },
  module: {
    kind: 'module',
  },
  namespace: {
    kind: 'namespace',
  },
  interface: {
    kind: 'interface',
  },
  object: {
    kind: 'object',
  },
  literal: {
    kind: 'literal',
    value: 'aa',
  },
  union: {
    kind: 'union',
    items: [{ type: 'string' }],
  },
  array: {
    kind: 'array',
    items: { type: 'string' },
  },
  event: {
    kind: 'event',
    params: [],
  },
  alias: {
    kind: 'alias',
    items: { type: 'string' },
  },
  enum: {
    kind: 'enum',
    entries: {},
  },
};

const tiers = [
  ['module'],
  ['namespace'],
  ['alias', 'class', 'enum', 'interface'],
  ['object', 'function', 'array', 'union', 'literal'],
  ['event'],
];

const validSubKinds = {
  function: { entries: [...tiers[3]], definitions: [...tiers[3]], events: [...tiers[4]] },
  class: {
    entries: [...tiers[3]],
    definitions: [...tiers[2], ...tiers[3]],
    staticEntries: [...tiers[3]],
    events: [...tiers[4]],
  },
  module: {
    entries: [...tiers[1], ...tiers[2], ...tiers[3]],
    definitions: [...tiers[1], ...tiers[2], ...tiers[3]],
    events: [...tiers[4]],
  },
  namespace: {
    entries: [...tiers[1], ...tiers[2], ...tiers[3]],
    definitions: [...tiers[1], ...tiers[2], ...tiers[3]],
    events: [...tiers[4]],
  },
  interface: { entries: [...tiers[3]], definitions: [...tiers[2], ...tiers[3]], events: [...tiers[4]] },
  object: { entries: [...tiers[3]], definitions: [...tiers[3]], events: [...tiers[4]] },
  literal: { entries: [], definitions: [] },
  alias: { entries: [], definitions: [] },
  enum: { entries: ['literal'], definitions: [] },
  union: { entries: [], definitions: [...tiers[3]] },
  array: { entries: [], definitions: [...tiers[3]] },
  event: { entries: [...tiers[3]], definitions: [...tiers[3]] },
};

describe('base', () => {
  function validate(obj, should = 'pass') {
    const validator = new Ajv({ allErrors: true, verbose: true, jsonPointers: true });
    validator.addMetaSchema(schema6);
    const isValid = validator.validate(schema, obj);
    if (!isValid && should === 'pass') {
      vv.validate(schema, obj); // print messages
    }
    expect(isValid).to.equal(should === 'pass');
  }
  it('should pass', () => {
    validate({
      scriptappy: pkg.version,
      'x-v': '',
      info: {
        name: 'a',
        version: '1.1.0-rc.1',
        license: '---',
        stability: 'stable',
        'x-v': '',
      },
      examples: ['ex'],
      entries: {},
      definitions: {},
    });
  });
});

describe('types', () => {
  function validate(def, obj, should = 'pass') {
    const validator = new Ajv({ allErrors: true, verbose: true, jsonPointers: true });
    const subschema = {
      $ref: `#/definitions/${def}`,
      definitions: schema.definitions,
    };
    const isValid = validator.validate(subschema, obj);
    if (!isValid && should === 'pass') {
      vv.validate(schema, {
        scriptappy: pkg.version,
        info: { name: 'a', version: '1.1.0' },
        entries: {
          a: obj,
        },
        definitions: {},
      });
    } else {
      // nothing
    }
    expect(isValid).to.equal(should === 'pass');
  }

  it('named', () => {
    validate('named', { name: 'n' });
  });

  it('templates', () => {
    validate('common/properties/templates', [{ name: 'n' }]);
    validate('common/properties/templates', [{ name: 'n', defaultValue: 'd', type: 'number' }]);
  });
});

describe('kinds', () => {
  const common = {
    description: 'descr',
    stability: 'stable',
    availability: {
      deprecated: true,
      since: '2.1.0',
    },
    examples: ['ex'],
    'x-v': true,
    type: 'number',
    optional: true,
    nullable: true,
    // defaultValue: true,
  };

  function validate(kind, obj, should = 'pass') {
    const validator = new Ajv({ allErrors: true, verbose: true, jsonPointers: true });
    const subschema = {
      $ref: `#/definitions/kind.${kind}`,
      definitions: schema.definitions,
    };
    const isValid = validator.validate(subschema, extend(obj, common));
    if (!isValid && should === 'pass') {
      vv.validate(schema, {
        scriptappy: pkg.version,
        info: { name: 'a', version: '1.1.0' },
        entries: {
          a: obj,
        },
        definitions: {},
      });
    } else {
      // (validator.errors || []).slice(0, 10).forEach(err => console.log(message(err, { path: '' })));
    }
    // const m = validator.errors ? validator.errors.slice(0, 1).map(err => message(err, { path: '' }))[0] : undefined;
    expect(isValid).to.equal(should === 'pass');
  }

  describe('should validate with minimum requirements', () => {
    Object.keys(validKinds).forEach((key) => {
      it(key, () => {
        validate(key, validKinds[key]);
      });
    });
  });

  describe('should not allow unknown properties', () => {
    Object.keys(validKinds).forEach((key) => {
      it(key, () => {
        validate(key, extend({}, validKinds[key], { random: true }), 'fail');
      });
    });
  });

  describe('should allow templates for', () => {
    Object.keys(validKinds)
      .filter((k) => ['class', 'function', 'interface', 'object'].includes(k))
      .forEach((key) => {
        it(key, () => {
          validate(key, extend({}, validKinds[key], { templates: [] }), 'pass');
        });
      });
  });

  describe('descendants', () => {
    const allKinds = [];
    tiers.forEach((t) => allKinds.push(...t));

    Object.keys(validSubKinds).forEach((key) => {
      describe(key, () => {
        Object.keys(validSubKinds[key]).forEach((prop) => {
          describe(prop, () => {
            const allowed = validSubKinds[key][prop];
            allowed.forEach((s) => {
              it(`should allow kind '${s}'`, () => {
                validate(
                  key,
                  extend({}, validKinds[key], {
                    [prop]: {
                      a: validKinds[s],
                    },
                  })
                );
              });
            });

            const notAllowed = allKinds.filter((k) => validSubKinds[key][prop].indexOf(k) === -1);
            notAllowed.forEach((s) => {
              it(`should NOT allow kind '${s}'`, () => {
                validate(
                  key,
                  extend({}, validKinds[key], {
                    [prop]: {
                      a: validKinds[s],
                    },
                  }),
                  'fail'
                );
              });
            });
          });
        });
      });
    });
  });

  describe('function', () => {
    it('properties', () => {
      const value = {
        kind: 'function',
        params: [],
        yields: [],
        async: true,
        this: { type: 'f' },
        emits: [{ type: 'ev' }],
        throws: [{ type: 'err' }],
      };
      validate('function', value);
    });

    validSubKinds.function.entries.forEach((t) => {
      it(`subtype - ${t}`, () => {
        const value = {
          kind: 'function',
          params: [
            extend({}, validKinds[t], {
              variable: true,
            }),
          ],
          generics: [validKinds[t]],
          yields: [validKinds[t]],
          returns: validKinds[t],
        };
        validate('function', value);
      });
    });
  });

  describe('interface', () => {
    validSubKinds.function.entries.forEach((t) => {
      it(`subtype - ${t}`, () => {
        const value = {
          kind: 'interface',
          params: [validKinds[t]],
          generics: [validKinds[t]],
        };
        validate('interface', value);
      });
    });
  });

  describe('literal', () => {
    it('properties', () => {
      const value = {
        kind: 'literal',
        value: 'v',
      };
      validate('literal', value);
    });
  });

  describe('array', () => {
    validSubKinds.function.entries.forEach((t) => {
      it(`tuple - ${t}`, () => {
        const value = {
          kind: 'array',
          items: [validKinds[t]],
        };
        validate('array', value);
      });
    });

    validSubKinds.function.entries.forEach((t) => {
      it(`type - ${t}`, () => {
        const value = {
          kind: 'array',
          items: validKinds[t],
        };
        validate('array', value);
      });
    });
  });

  describe('union', () => {
    validSubKinds.function.entries.forEach((t) => {
      it(`type - ${t}`, () => {
        const value = {
          kind: 'union',
          items: [validKinds[t]],
        };
        validate('union', value);
      });
    });
  });
});
