/* eslint-disable global-require */
const typeParser = require('../lib/type-parser');
const types = require('../lib/entities');

jest.mock('../lib/type-parser');
jest.mock('../lib/collector', () => () => ({
  collectParamsFromDoc: jest.fn(() => ['params']),
  collectPropsFromDoc: jest.fn(() => ({ props: true })),
}));

describe('entities', () => {
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

  let sandbox;
  let parse;
  let getTypeFromCodeMeta;
  let getTypedefFromComment;
  let getReturnFromComment;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    parse = sandbox.stub();
    getTypeFromCodeMeta = sandbox.stub();
    getTypedefFromComment = sandbox.stub();
    getReturnFromComment = sandbox.stub();

    typeParser.parse.mockImplementation(parse);
    typeParser.getTypeFromCodeMeta.mockImplementation(getTypeFromCodeMeta);
    typeParser.getTypedefFromComment.mockImplementation(getTypedefFromComment);
    typeParser.getReturnFromComment.mockImplementation(getReturnFromComment);
  });

  afterEach(() => {
    sandbox.reset();
  });

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

    it('template', () => {
      parse.returns({});
      const a = types.tags(
        {
          tags: [
            {
              title: 'template',
              value: { name: 'T' },
            },
          ],
        },
        { logger }
      );
      expect(a).to.eql({
        templates: [{ name: 'T' }],
      });
    });

    it('template - default value', () => {
      parse.returns({});
      const a = types.tags(
        {
          tags: [
            {
              title: 'template',
              value: { name: 'T', defaultvalue: false },
            },
          ],
        },
        { logger }
      );
      expect(a).to.eql({
        templates: [{ name: 'T', defaultValue: false }],
      });
    });

    it('template - type', () => {
      parse.withArgs('number').returns({ type: 'number' });
      const a = types.tags(
        {
          tags: [
            {
              title: 'template',
              value: { name: 'T', type: { names: ['number'] } },
            },
          ],
        },
        { logger }
      );
      expect(a).to.eql({
        templates: [{ name: 'T', type: 'number' }],
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

    it('exp', () => {
      parse.withArgs('xx').returns({
        type: 'expression',
      });
      const o = types.typedef(
        {
          exp: 'xx',
        },
        cfg
      );
      expect(o).to.eql({
        type: 'expression',
      });
    });

    it('object - from meta', () => {
      getTypeFromCodeMeta.returns({
        kind: 'object',
      });
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
      parse.withArgs('object').returns({ type: 'object' });
      const doc = {
        name: 'person',
        type: { names: ['object'] },
        properties: 'meh',
      };
      const o = types.typedef(doc);
      expect(o).to.eql({
        kind: 'object',
        entries: { props: true },
      });
    });

    it('typedef with params should be a function kind', () => {
      const o = types.typedef({
        kind: 'typedef',
        type: { names: ['function'] },
        params: [],
      });
      expect(o).to.eql({
        kind: 'function',
        params: ['params'],
      });
    });

    it('typedef as callback should be a function kind', () => {
      const o = types.typedef({
        comment: 'bla @callback',
        kind: 'typedef',
      });

      expect(o).to.eql({
        kind: 'function',
        params: ['params'],
      });
    });

    it('typedef as alias type', () => {
      const doc = {
        comment: '/**\n*@typedef*/',
        kind: 'typedef',
        scope: 'global',
      };
      getTypedefFromComment.withArgs(doc.comment).returns('something');
      parse.withArgs('something').returns({ magic: 'stuff' });
      const o = types.typedef(doc);
      expect(o).to.eql({
        kind: 'alias',
        items: {
          magic: 'stuff',
        },
      });
    });

    it('typedef as object kind', () => {
      const doc = {
        comment: '/**\n*@typedef*/',
        kind: 'typedef',
        properties: 'props',
      };
      getTypedefFromComment.withArgs(doc.comment).returns('object');
      parse.withArgs('object').returns({ type: 'object' });
      const o = types.typedef(doc);
      expect(o).to.eql({
        kind: 'object',
        entries: { props: true },
      });
    });

    it('function', () => {
      getReturnFromComment.returns('ret-expr');
      parse.withArgs('ret-expr').returns({ ret: 'magic' });
      parse.withArgs('NullPointerException').returns({ exc: 'nil' });
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
            exc: 'nil',
          },
        ],
        params: ['params'],
        returns: {
          description: 'a promise',
          ret: 'magic',
        },
        this: {
          type: 'Person',
        },
        async: true,
      });
    });

    it('generator function', () => {
      parse.withArgs('number').returns({ type: 'num' });
      parse.withArgs('string').returns({ type: 'str' });
      const o = types.typedef({
        name: 'generate',
        kind: 'function',
        generator: true,
      });

      expect(o).to.eql({
        kind: 'function',
        params: ['params'],
        generator: true,
      });

      const o2 = types.typedef({
        name: 'generate',
        kind: 'function',
        yields: [{ type: { names: ['number'] }, description: 'descr' }],
      });

      expect(o2).to.eql({
        kind: 'function',
        params: ['params'],
        generator: true,
        yields: {
          type: 'num',
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
        params: ['params'],
        generator: true,
        yields: {
          kind: 'union',
          items: [{ type: 'num' }, { type: 'str' }],
        },
      });
    });

    it('event', () => {
      const o = types.typedef({
        kind: 'event',
        name: 'start',
        description: 'descr',
        params: ['a'],
      });

      expect(o).to.eql({
        kind: 'event',
        params: ['params'],
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

    it('enum', () => {
      const o = types.typedef({
        name: 'STATS',
        kind: 'doesntmatter',
        description: 'descr',
        isEnum: true,
      });

      expect(o).to.eql({
        kind: 'enum',
        entries: {},
      });
    });

    it('interface comment with params', () => {
      const o = types.typedef({
        name: 'Person',
        kind: 'interface',
        description: 'iface',
        params: ['par'],
        meta: { code: {} },
      });

      expect(o).to.eql({
        kind: 'interface',
        params: ['params'],
        entries: {},
      });
    });

    it('interface comment with properties', () => {
      const doc = {
        name: 'Person',
        kind: 'interface',
        description: 'iface',
        properties: 'props',
        meta: { code: {} },
      };
      const o = types.typedef(doc);

      expect(o).to.eql({
        kind: 'interface',
        params: ['params'],
        entries: {
          props: true,
        },
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
        params: ['params'],
      });
    });

    it('class', () => {
      const o = types.typedef({
        name: 'Person',
        kind: 'class',
        classdesc: 'Class descr',
        description: 'Constructor descr',
        properties: 'props',
        params: ['params'],
      });

      expect(o).to.eql({
        kind: 'class',
        constructor: {
          kind: 'function',
          description: 'Constructor descr',
          params: ['params'],
        },
        entries: { props: true },
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
      parse.withArgs('string').returns({ type: 'str' });
      parse.withArgs('boolean').returns({ type: 'bool' });
      const o = types.typedef({
        type: { names: ['string', 'boolean'] },
      });

      expect(o).to.eql({
        kind: 'union',
        items: [{ type: 'str' }, { type: 'bool' }],
      });
    });

    it('logrule with name', () => {
      const c = {
        logRule: sandbox.spy(),
      };
      getTypeFromCodeMeta.returns({});
      const doc = { meta: {}, name: 'n' };
      const o = types.typedef(doc, c);

      expect(c.logRule).to.have.been.calledWithExactly(doc, 'no-missing-types', "Missing type on 'n'");

      expect(o).to.eql({
        type: 'any',
      });
    });

    it('logrule without name', () => {
      const c = {
        logRule: sandbox.spy(),
      };
      getTypeFromCodeMeta.returns({});
      const o = types.typedef({ meta: {} }, c);

      expect(c.logRule).to.have.been.calledWithExactly(undefined, 'no-missing-types', 'Missing type');

      expect(o).to.eql({
        type: 'any',
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

    it('should add "value" when kind is literal', () => {
      parse.withArgs('string').returns({ kind: 'literal' });
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
        kind: 'literal',
        value: 'foo',
      });
    });

    it('defaultValue from unary numeric meta', () => {
      parse.withArgs('numb').returns({ type: 'number' });
      const o = types.entity({
        meta: {
          code: {
            type: 'UnaryExpression',
            value: -1,
          },
        },
        type: { names: ['numb'] },
      });
      expect(o).to.eql({
        type: 'number',
        defaultValue: -1,
      });
    });

    it('defaultValue on boolean string', () => {
      parse.withArgs('bool').returns({ type: 'boolean' });
      const o = types.entity({
        type: { names: ['bool'] },
        defaultvalue: 'true',
      });
      expect(o).to.eql({
        type: 'boolean',
        defaultValue: true,
      });
    });

    it('defaultValue on boolean', () => {
      parse.withArgs('bool').returns({ type: 'boolean' });
      const o = types.entity({
        type: { names: ['bool'] },
        defaultvalue: true,
      });
      expect(o).to.eql({
        type: 'boolean',
        defaultValue: true,
      });
    });
  });
});
