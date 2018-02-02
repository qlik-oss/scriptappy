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
  it('stability - locked', () => {
    const a = types.tags({
      tags: [{
        title: 'locked',
      }],
    }, { logger });
    expect(a).to.eql({
      stability: 'locked',
    });
  });

  it('stability - stable', () => {
    const a = types.tags({
      tags: [{
        title: 'stable',
      }],
    }, { logger });
    expect(a).to.eql({
      stability: 'stable',
    });
  });

  it('stability - experimental', () => {
    const a = types.tags({
      tags: [{
        title: 'experimental',
      }],
    }, { logger });
    expect(a).to.eql({
      stability: 'experimental',
    });
  });

  it('stability - by value', () => {
    const a = types.tags({
      tags: [{
        title: 'stability',
        value: 'stable',
      }],
    }, { logger });
    expect(a).to.eql({
      stability: 'stable',
    });
  });

  it('vendor', () => {
    const a = types.tags({
      tags: [{
        title: 'random-tag',
        value: 'yes',
      }],
    });
    expect(a).to.eql({
      'x-random-tag': 'yes',
    });
  });

  it('x-vendor', () => {
    const a = types.tags({
      tags: [{
        title: 'x-random-tag',
        value: 'yes',
      }],
    });
    expect(a).to.eql({
      'x-random-tag': 'yes',
    });
  });

  it('ignored', () => {
    const a = types.tags({
      tags: [{
        title: 'entry',
        value: 'foo',
      }],
    });
    expect(a).to.eql({});
  });
});

describe('collect params', () => {
  it('one', () => {
    const params = types.collectParams([{
      type: {
        names: ['object'],
      },
      variable: true,
      defaultvalue: 3,
      description: 'descr',
      name: 'param name',
    }]);

    expect(params).to.eql([{
      description: 'descr',
      name: 'param name',
      defaultValue: 3,
      variable: true,
      type: 'object',
    }]);
  });


  it('nested', () => {
    const params = types.collectParams([{
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
    }]);

    expect(params).to.eql([{
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
    }]);
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

    expect(params).to.eql([{
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
    }]);
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
    const o = types.typedef({
    }, cfg);

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

  it('array - tuple', () => {
    const o = types.typedef({
      type: { names: ['Array.<string, number, Promise.<string>>'] },
    });

    expect(o).to.eql({
      kind: 'array',
      items: [
        { type: 'string' },
        { type: 'number' },
        { type: 'Promise<string>' },
      ],
    });
  });

  it.skip('object - key value', () => {
    const o = types.typedef({
      type: { names: ['object.<string, number>'] },
    });

    expect(o).to.eql({
      kind: 'object',
      items: [ // ?
        { type: 'string' },
        { type: 'number' },
      ],
    });
  });

  it('object - setter', () => {
    const o = types.typedef({
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
    }, { logger });

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
      fires: [
        'generate#event:start',
      ],
      exceptions: [{
        type: { names: ['NullPointerException'] },
        description: 'oops',
      }],
      returns: [{
        type: {
          names: ['Promise.<string>'],
        },
        description: 'a promise',
      }],
    });

    expect(o).to.eql({
      kind: 'function',
      emits: [{
        type: 'generate#event:start',
      }],
      throws: [{
        description: 'oops',
        type: 'NullPointerException',
      }],
      params: [],
      returns: {
        description: 'a promise',
        type: 'Promise<string>',
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
        items: [
          { type: 'number' },
          { type: 'string' },
        ],
      },
    });
  });


  it('event', () => {
    const o = types.typedef({
      kind: 'event',
      name: 'start',
      description: 'descr',
      params: [{
        type: {
          names: ['string'],
        },
        name: 'first',
      }],
    });

    expect(o).to.eql({
      kind: 'event',
      params: [{
        name: 'first',
        type: 'string',
      }],
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

  it('interface', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'interface',
      description: 'iface',
      params: [{ name: 'first', type: { names: ['string'] } }],
    });

    expect(o).to.eql({
      kind: 'interface',
      params: [{
        name: 'first',
        type: 'string',
      }],
      entries: {},
    });
  });


  it('class', () => {
    const o = types.typedef({
      name: 'Person',
      kind: 'class',
      classdesc: 'Class descr',
      description: 'Constructor descr',
      params: [{ name: 'first', type: { names: ['string'] } }],
    });

    expect(o).to.eql({
      kind: 'class',
      constructor: {
        description: 'Constructor descr',
        params: [{
          name: 'first',
          type: 'string',
        }],
      },
      entries: {},
    });
  });

  it('union', () => {
    const o = types.typedef({
      type: { names: ['string', 'Array.<string>'] },
    });

    expect(o).to.eql({
      kind: 'union',
      items: [
        { type: 'string' },
        { type: 'Array<string>' },
      ],
    });
  });
});

describe('entity', () => {
  it('base', () => {
    const o = types.entity({
      name: 'Person',
      description: 'descr',
      optional: true,
      nullable: true,
      variable: true,
      examples: 'ex',
      implements: ['Iterable'],
      augments: ['Dummy'],
    }, cfg, { includeName: true });

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
});
