const types = require('../src/entities');

const logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  verbose: () => {},
};

const cfg = {
  logger,
  logRule: () => {},
};

describe('availability', () => {
  it('should support "since" only', () => {
    const a = types.availability({
      since: '3.2.2',
    });
    expect(a).to.eql({
      availability: {
        since: '3.2.2',
      },
    });
  });

  it('should support "deprecated" bool', () => {
    const a = types.availability({
      deprecated: true,
    });
    expect(a).to.eql({
      availability: {
        deprecated: true,
      },
    });
  });

  it('should parse "since"', () => {
    const a = types.availability({
      deprecated: 'Deprecated since 2.4.8, use magic instead',
    });
    expect(a).to.eql({
      availability: {
        deprecated: {
          description: 'Deprecated since 2.4.8, use magic instead',
          since: '2.4.8',
        },
      },
    });
  });
});

describe('tags', () => {
  it('excluded', () => {
    const a = types.tags(
      {
        tags: [
          {
            title: 'a',
          },
          {
            title: 'b',
          },
        ],
      },
      {
        parse: {
          tags: { exclude: ['b'] },
        },
      }
    );
    expect(a).to.eql({
      'x-a': true,
    });
  });

  it('included', () => {
    const a = types.tags(
      {
        tags: [
          {
            title: 'a',
          },
          {
            title: 'b',
          },
        ],
      },
      {
        parse: {
          tags: { include: ['b'], exclude: ['b'] }, // include should be prioritized over exclude
        },
      }
    );
    expect(a).to.eql({
      'x-b': true,
    });
  });

  it('stability - locked', () => {
    const a = types.tags(
      {
        tags: [
          {
            title: 'locked',
          },
        ],
      },
      { logger }
    );
    expect(a).to.eql({
      stability: 'locked',
    });
  });

  it('stability - stable', () => {
    const a = types.tags(
      {
        tags: [
          {
            title: 'stable',
          },
        ],
      },
      { logger, parse: { tags: { exclude: ['stable'] } } }
    );
    expect(a).to.eql({
      stability: 'stable',
    });
  });

  it('stability - experimental', () => {
    const a = types.tags(
      {
        tags: [
          {
            title: 'experimental',
          },
        ],
      },
      { logger }
    );
    expect(a).to.eql({
      stability: 'experimental',
    });
  });

  it('stability - by value', () => {
    const a = types.tags(
      {
        tags: [
          {
            title: 'stability',
            value: 'stable',
          },
        ],
      },
      { logger, parse: { tags: { exclude: ['stability'] } } }
    );
    expect(a).to.eql({
      stability: 'stable',
    });
  });

  it('vendor', () => {
    const a = types.tags({
      tags: [
        {
          title: 'random-tag',
          value: 'yes',
        },
        {
          title: 'custom-tag',
        },
      ],
    });
    expect(a).to.eql({
      'x-random-tag': 'yes',
      'x-custom-tag': true,
    });
  });

  it('x-vendor', () => {
    const a = types.tags({
      tags: [
        {
          title: 'x-random-tag',
          value: 'yes',
        },
        {
          title: 'x-custom-tag',
        },
      ],
    });
    expect(a).to.eql({
      'x-random-tag': 'yes',
      'x-custom-tag': true,
    });
  });

  it('ignored', () => {
    const a = types.tags({
      tags: [
        {
          title: 'entry',
          value: 'foo',
        },
      ],
    });
    expect(a).to.eql({});
  });

  it('inline', () => {
    const o = types.entity(
      {
        description: 'descr {@deprecated since 2.0.0}{@since 1.2.0}{@stable}',
      },
      cfg,
      { includeName: true }
    );

    expect(o).to.eql({
      description: 'descr',
      availability: {
        deprecated: {
          description: 'since 2.0.0',
          since: '2.0.0',
        },
        since: '1.2.0',
      },
      stability: 'stable',
      type: 'any',
    });
  });
});

describe('collect params', () => {
  it('one', () => {
    const params = types.collectParams([
      {
        type: {
          names: ['object'],
        },
        variable: true,
        defaultvalue: 3,
        description: 'descr',
        name: 'param name',
      },
    ]);

    expect(params).to.eql([
      {
        description: 'descr',
        name: 'param name',
        defaultValue: 3,
        variable: true,
        type: 'object',
      },
    ]);
  });

  it('nested', () => {
    const params = types.collectParams([
      {
        type: {
          names: ['object'],
        },
        nullable: true,
        description: 'descr',
        name: 'options',
      },
      {
        type: {
          names: ['string'],
        },
        optional: true,
        name: 'options.model',
      },
    ]);

    expect(params).to.eql([
      {
        name: 'options',
        description: 'descr',
        nullable: true,
        kind: 'object',
        entries: {
          model: {
            optional: true,
            type: 'string',
          },
        },
      },
    ]);
  });

  it('nested array', () => {
    const params = types.collectParams([
      {
        type: {
          names: ['Array.<object>'],
        },
        description: 'descr',
        name: 'options',
      },
      {
        type: {
          names: ['string'],
        },
        description: 'descript',
        name: 'options[].model',
      },
    ]);

    expect(params).to.eql([
      {
        name: 'options',
        description: 'descr',
        kind: 'array',
        items: {
          kind: 'object',
          entries: {
            model: {
              description: 'descript',
              type: 'string',
            },
          },
        },
      },
    ]);
  });
});

describe('collect props', () => {
  it('nested array', () => {
    const props = types.collectProps([
      {
        type: {
          names: ['Array.<object>'],
        },
        description: 'descr',
        name: 'options',
      },
      {
        type: {
          names: ['string'],
        },
        description: 'descript',
        name: 'options[].model',
      },
    ]);

    expect(props).to.eql({
      options: {
        description: 'descr',
        kind: 'array',
        items: {
          kind: 'object',
          entries: {
            model: {
              description: 'descript',
              type: 'string',
            },
          },
        },
      },
    });
  });
});

describe('type', () => {
  it('any', () => {
    const o = types.typedef({}, cfg);

    expect(o).to.eql({
      type: 'any',
    });
  });

  it('literal', () => {
    const o = types.typedef({
      meta: {
        code: {
          type: 'Literal',
          value: 'foo',
        },
      },
    });

    expect(o).to.eql({
      kind: 'literal',
      value: 'foo',
    });
  });

  it('object - from meta', () => {
    const o = types.typedef({
      meta: {
        code: {
          type: 'ObjectExpression',
        },
      },
    });

    expect(o).to.eql({
      kind: 'object',
    });
  });

  it('object', () => {
    const o = types.typedef({
      name: 'person',
      type: { names: ['object'] },
      properties: [
        {
          type: { names: ['object'] },
          name: 'first',
          nullable: true,
        },
        {
          type: { names: ['string'] },
          name: 'first.sub',
          optional: true,
        },
        {
          type: { names: ['object'] },
          name: 'first.obj',
        },
        {
          description: 'func',
          type: { names: ['function'] },
          name: 'get',
          optional: true,
        },
      ],
      longname: 'person',
    });

    expect(o).to.eql({
      kind: 'object',
      entries: {
        first: {
          nullable: true,
          kind: 'object',
          entries: {
            sub: {
              optional: true,
              type: 'string',
            },
            obj: {
              type: 'object',
            },
          },
        },
        get: {
          description: 'func',
          optional: true,
          type: 'function',
        },
      },
    });
  });

  it('array', () => {
    const o = types.typedef({
      type: { names: ['Array.<object>'] },
    });

    expect(o).to.eql({
      kind: 'array',
      items: {
        type: 'object',
      },
    });
  });

  it('array', () => {
    const o = types.typedef({
      type: { names: ['array'] },
    });

    expect(o).to.eql({
      kind: 'array',
      items: {
        type: 'any',
      },
    });
  });

  it('array generics', () => {
    const o = types.typedef({
      type: { names: ['Array.< (  number | boolean )>'] },
    });

    expect(o).to.eql({
      kind: 'array',
      items: {
        kind: 'union',
        type: 'any',
        items: [{ type: 'number' }, { type: 'boolean' }],
      },
    });
  });

  it('array - tuple', () => {
    const o = types.typedef({
      type: { names: ['Array.<(string | number ), Promise.<string>>'] },
    });

    expect(o).to.eql({
      kind: 'array',
      items: [
        { kind: 'union', items: [{ type: 'string' }, { type: 'number' }] },
        { type: 'Promise', generics: [{ type: 'string' }] },
      ],
    });
  });

  it('generics', () => {
    const o = types.typedef(
      {
        type: { names: ['Promise.<object.<boolean>, Array.<(string|number)>>'] },
      },
      { logRule: () => {} }
    );

    expect(o).to.eql({
      type: 'Promise',
      generics: [
        {
          type: 'object',
          generics: [{ type: 'boolean' }],
        },
        {
          kind: 'array',
          items: {
            kind: 'union',
            type: 'any',
            items: [{ type: 'string' }, { type: 'number' }],
          },
        },
      ],
    });
  });

  it('generics - properties', () => {
    const o = types.typedef(
      {
        type: { names: ['Object.<string, number>'] },
        properties: [
          {
            type: { names: ['string'] },
            name: 'first',
          },
        ],
      },
      { logRule: () => {} }
    );

    expect(o).to.eql({
      type: 'object',
      generics: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
      entries: {
        first: {
          type: 'string',
        },
      },
    });
  });

  it('generics - union', () => {
    const o = types.typedef(
      {
        type: { names: ['Promise.<  ( string|  number) | boolean, number  >'] },
      },
      { logRule: () => {} }
    );

    expect(o).to.eql({
      type: 'Promise',
      generics: [
        {
          kind: 'union',
          items: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
        },
        { type: 'number' },
      ],
    });
  });

  it('object - key value', () => {
    const o = types.typedef({
      type: { names: ['object.<string, number>'] },
    });

    expect(o).to.eql({
      type: 'object',
      generics: [{ type: 'string' }, { type: 'number' }],
    });
  });

  it('object - setter', () => {
    const o = types.typedef(
      {
        meta: {
          code: { paramnames: ['v'] },
        },
        kind: 'member',
        params: [
          {
            type: {
              names: ['string'],
            },
            description: 'the nam',
            name: 'v',
          },
        ],
      },
      { logger }
    );

    expect(o).to.eql({
      type: 'string',
    });
  });

  it('function', () => {
    const o = types.typedef({
      name: 'generate',
      kind: 'function',
      description: 'descr',
      async: true,
      params: [],
      this: 'Person',
      fires: ['generate#event:start'],
      exceptions: [
        {
          type: { names: ['NullPointerException'] },
          description: 'oops',
        },
      ],
      returns: [
        {
          type: {
            names: ['Promise.<string>'],
          },
          description: 'a promise',
        },
      ],
    });

    expect(o).to.eql({
      kind: 'function',
      emits: [
        {
          type: 'generate#event:start',
        },
      ],
      throws: [
        {
          description: 'oops',
          type: 'NullPointerException',
        },
      ],
      params: [],
      returns: {
        description: 'a promise',
        type: 'Promise',
        generics: [{ type: 'string' }],
      },
      this: {
        type: 'Person',
      },
      async: true,
    });
  });

  it('generator function', () => {
    const o = types.typedef({
      name: 'generate',
      kind: 'function',
      generator: true,
    });

    expect(o).to.eql({
      kind: 'function',
      params: [],
      generator: true,
    });

    const o2 = types.typedef({
      name: 'generate',
      kind: 'function',
      yields: [{ type: { names: ['number'] }, description: 'descr' }],
    });

    expect(o2).to.eql({
      kind: 'function',
      params: [],
      generator: true,
      yields: {
        type: 'number',
        description: 'descr',
      },
    });

    const o3 = types.typedef({
      name: 'generate',
      kind: 'function',
      yields: [{ type: { names: ['number'] } }, { type: { names: ['string'] } }],
    });

    expect(o3).to.eql({
      kind: 'function',
      params: [],
      generator: true,
      yields: {
        kind: 'union',
        items: [{ type: 'number' }, { type: 'string' }],
      },
    });
  });

  it('event', () => {
    const o = types.typedef({
      kind: 'event',
      name: 'start',
      description: 'descr',
      params: [
        {
          type: {
            names: ['string'],
          },
          name: 'first',
        },
      ],
    });

    expect(o).to.eql({
      kind: 'event',
      params: [
        {
          name: 'first',
          type: 'string',
        },
      ],
    });
  });

  it('module', () => {
    const o = types.typedef({
      name: 'path',
      kind: 'module',
      description: 'descr',
      stability: 1,
    });

    expect(o).to.eql({
      kind: 'module',
      entries: {},
    });
  });

  it('namespace', () => {
    const o = types.typedef({
      name: 'path',
      kind: 'namespace',
      description: 'descr',
      stability: 1,
    });

    expect(o).to.eql({
      kind: 'namespace',
      entries: {},
    });
  });

  it('interface comment with params', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'interface',
      description: 'iface',
      params: [{ name: 'first', type: { names: ['string'] } }],
      meta: { code: {} },
    });

    expect(o).to.eql({
      kind: 'interface',
      params: [
        {
          name: 'first',
          type: 'string',
        },
      ],
      entries: {},
    });
  });

  it('interface from ObjectExpression should be treated as an object', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'interface',
      description: 'iface',
      meta: { code: { type: 'ObjectExpression' } },
    });

    expect(o).to.eql({
      kind: 'interface',
      entries: {},
    });
  });

  it('interface with an AST node should be treated as a function', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'interface',
      description: 'iface',
      params: [],
      meta: { code: { type: 'foo' } },
    });

    expect(o).to.eql({
      kind: 'interface',
      entries: {},
      params: [],
    });
  });

  it('class', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'class',
      classdesc: 'Class descr',
      description: 'Constructor descr',
      properties: [
        {
          type: { names: ['object'] },
          name: 'first',
        },
        {
          type: { names: ['string'] },
          name: 'first.sub',
          optional: true,
        },
      ],
      params: [{ name: 'first', type: { names: ['string'] } }],
    });

    expect(o).to.eql({
      kind: 'class',
      constructor: {
        kind: 'function',
        description: 'Constructor descr',
        params: [
          {
            name: 'first',
            type: 'string',
          },
        ],
      },
      entries: {
        first: {
          kind: 'object',
          entries: {
            sub: {
              optional: true,
              type: 'string',
            },
          },
        },
      },
    });
  });

  it('class with hideconstructor', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'class',
      hideconstructor: true,
    });

    expect(o).to.eql({
      kind: 'class',
      entries: {},
    });
  });

  it('union', () => {
    const o = types.typedef({
      type: { names: ['string', 'Array.<string>'] },
    });

    expect(o).to.eql({
      kind: 'union',
      type: 'any',
      items: [{ type: 'string' }, { kind: 'array', items: { type: 'string' } }],
    });
  });
});

describe('entity', () => {
  it('base', () => {
    const o = types.entity(
      {
        name: 'Person',
        description: 'descr',
        optional: true,
        nullable: true,
        variable: true,
        examples: 'ex',
        implements: ['Iterable'],
        augments: ['Dummy'],
      },
      cfg,
      { includeName: true }
    );

    expect(o).to.eql({
      name: 'Person',
      type: 'any',
      description: 'descr',
      optional: true,
      nullable: true,
      variable: true,
      examples: 'ex',
      implements: [{ type: 'Iterable' }],
      extends: [{ type: 'Dummy' }],
    });
  });

  it('class', () => {
    const o = types.entity({
      kind: 'class',
      classdesc: 'class descr',
    });

    expect(o.description).to.equal('class descr');
  });

  it('defaultValue', () => {
    const o = types.entity(
      {
        defaultvalue: 'def',
      },
      cfg
    );

    expect(o.defaultValue).to.equal('def');
  });

  it('defaultValue from literal meta', () => {
    const o = types.entity({
      meta: {
        code: {
          type: 'Literal',
          value: 'foo',
        },
      },
      type: { names: ['string'] },
    });

    expect(o).to.eql({
      type: 'string',
      defaultValue: 'foo',
    });
  });

  it('defaultValue from unary numeric meta', () => {
    const o = types.entity({
      meta: {
        code: {
          type: 'UnaryExpression',
          value: -1,
        },
      },
      type: { names: ['number'] },
    });

    expect(o).to.eql({
      type: 'number',
      defaultValue: -1,
    });
  });

  it('defaultValue on boolean string', () => {
    const o = types.entity({
      type: { names: ['boolean'] },
      defaultvalue: 'true',
    });

    expect(o).to.eql({
      type: 'boolean',
      defaultValue: true,
    });
  });

  it('defaultValue on boolean', () => {
    const o = types.entity({
      type: { names: ['boolean'] },
      defaultvalue: true,
    });

    expect(o).to.eql({
      type: 'boolean',
      defaultValue: true,
    });
  });
});
