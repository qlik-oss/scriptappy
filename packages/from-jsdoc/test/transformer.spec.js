const t = require('../lib/transformer');
const entities = require('../lib/entities');

jest.mock('../lib/check-types', () => () => ({}));
jest.mock('../lib/entities');

describe('transformer', () => {
  let sandbox;
  let docletMock;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    docletMock = sandbox.stub();
    entities.doclet.mockImplementation(docletMock);
  });

  afterEach(() => {
    sandbox.reset();
  });

  const logger = {
    error: () => {},
    warn: () => {},
    info: () => {},
    verbose: () => {},
  };

  const cfg = {
    api: {},
    spec: {
      validate: false,
    },
    parse: {
      types: {
        Carr: {
          rewrite: 'car',
        },
      },
      rules: {},
    },
    output: { sort: {} },
    logger,
    logRule: () => {},
  };

  describe('collect', () => {
    it('should recognize all kinds', () => {
      const doclets = [
        { kind: 'class', longname: 'a' },
        { kind: 'constant', longname: 'b' },
        { kind: 'event', longname: 'c' },
        { kind: 'function', longname: 'd' },
        { kind: 'interface', longname: 'e' },
        { kind: 'member', longname: 'f' },
        { kind: 'module', longname: 'g' },
        { kind: 'namespace', longname: 'h' },
        { kind: 'typedef', longname: 'i' },
        { kind: 'foo', longname: 'j' },
      ];

      const d = (doclet) => doclet;

      const { ids } = t.collect(doclets, cfg, d);
      expect(Object.keys(ids)).to.eql(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
    });

    it('should collect multiple', () => {
      const doclets = [
        { kind: 'function', longname: 'd', descr: 'first' },
        { kind: 'function', longname: 'd', descr: 'second' },
      ];

      const d = (doclet) => doclet;

      const { ids } = t.collect(doclets, cfg, d);
      expect(ids.d).to.eql([
        { kind: 'function', longname: 'd', descr: 'first' },
        { kind: 'function', longname: 'd', descr: 'second' },
      ]);
    });

    it('should recognize package', () => {
      const doclets = [{ kind: 'package' }];

      const { pack } = t.collect(doclets, cfg, () => {});
      expect(pack).to.eql({ kind: 'package' });
    });

    it('should skip unnamed exports', () => {
      const doclets = [
        {
          meta: { code: { name: 'module.exports' } },
          longname: 'module.exports',
        },
      ];

      const d = (doclet) => doclet;

      const { ids } = t.collect(doclets, cfg, d);
      expect(Object.keys(ids).length).to.equal(0);
    });

    it('should handle default exports', () => {
      const doclets = [
        { kind: 'module', longname: 'module:mod' },
        { kind: 'function', longname: 'module:mod' },
      ];

      const d = (doclet) => doclet;

      const { ids } = t.collect(doclets, cfg, d);
      expect(ids['module:mod@default'][0]).to.eql({
        kind: 'function',
        longname: 'module:mod',
      });
    });

    it('should mark filtered doclets as private', () => {
      const doclets = [{ longname: 'f', kind: 'member' }];

      const d = (doclet) => doclet;

      const c = {
        ...cfg,
        parse: {
          ...cfg.parse,
          filter: (doc) => doc.longname !== 'f',
        },
      };

      const { priv } = t.collect(doclets, c, d);
      expect(priv.f[0].__access).to.equal('private');
    });
  });

  describe('log rule', () => {
    it('should log error', () => {
      const violations = {};
      const doc = { meta: { path: 'a', filename: 'b' } };
      t.logRule(
        {
          logger: {},
          parse: {
            types: {},
            rules: {
              'my-rule': 2,
            },
          },
        },
        doc,
        'my-rule',
        'oops',
        violations
      );

      expect(violations).eql({
        'a/b': [
          {
            doc,
            message: 'oops',
            rule: 'my-rule',
            severity: 2,
          },
        ],
      });
    });

    it('should not log with severity <= 0', () => {
      const violations = {};
      t.logRule(
        {
          logger: {},
          parse: {
            types: {},
            rules: {
              'my-rule': 0,
            },
          },
        },
        {},
        'my-rule',
        'oops',
        violations
      );

      expect(violations).to.eql({});
    });
  });

  describe('transform', () => {
    it('should organize global entries', () => {
      const { entries } = t.transform({
        ids: {
          ent: [{}],
        },
        priv: {
          ent: [{ __id: 'foo', __isEntry: true }],
        },
      });

      expect(entries).to.eql({
        foo: {},
      });
    });

    it('should organize global definitions', () => {
      const { definitions } = t.transform({
        ids: {
          a: [{}],
          b: [{}],
        },
        priv: {
          a: [{ __id: 'inner', __memberScope: 'inner' }],
          b: [{ __id: 'def' }],
        },
      });

      expect(definitions).to.eql({
        inner: {},
        def: {},
      });
    });

    it('should default to "definitions"', () => {
      const { definitions } = t.transform({
        ids: {
          Person: [{}],
          'Person#name': [{}],
        },
        priv: {
          Person: [{ __id: 'Person' }],
          'Person#name': [{ __scopeName: 'name', __memberOf: 'Person' }],
        },
      });

      expect(definitions).to.eql({
        Person: {
          entries: {
            name: {},
          },
        },
      });
    });

    it('should add "kind: event" to events property', () => {
      const { definitions } = t.transform({
        ids: {
          Person: [{}],
          ev: [{ kind: 'event' }],
        },
        priv: {
          Person: [{ __id: 'Person' }],
          ev: [{ __scopeName: 'change', __memberOf: 'Person' }],
        },
      });

      expect(definitions).to.eql({
        Person: {
          events: {
            change: { kind: 'event' },
          },
        },
      });
    });

    it('should add defs to "definitions"', () => {
      const { entries } = t.transform({
        ids: {
          Person: [{}],
          'Person#name': [{}],
        },
        priv: {
          Person: [{ __id: 'Person', __isEntry: true }],
          'Person#name': [{ __scopeName: 'name', __memberOf: 'Person', __memberScope: 'inner' }],
        },
      });

      expect(entries).to.eql({
        Person: {
          definitions: {
            name: {},
          },
        },
      });
    });

    it('should add class statics to "staticEntries"', () => {
      const { entries } = t.transform({
        ids: {
          Person: [{ kind: 'class' }],
          'Person.name': [{}],
        },
        priv: {
          Person: [{ __id: 'Person', __isEntry: true }],
          'Person.name': [{ __scopeName: 'name', __memberOf: 'Person', __memberScope: 'static' }],
        },
      });

      expect(entries).to.eql({
        Person: {
          kind: 'class',
          staticEntries: {
            name: {},
          },
        },
      });
    });

    it('should handle default exports', () => {
      const { entries } = t.transform({
        ids: {
          'module:fs': [{ kind: 'module' }],
          'module:fs@default': [{ kind: 'object', description: 'Default export' }],
          'module:fs.name': [{ kind: 'member' }],
        },
        priv: {
          'module:fs': [{ __id: 'module:fs', __scopeName: 'fs' }],
          'module:fs@default': [{ __scopeName: '@default', __memberOf: 'module:fs' }],
          'module:fs.name': [
            {
              __id: 'module:fs.name',
              __scopeName: 'name',
              __memberOf: 'module:fs',
              __meta: { code: { name: '' } },
            },
          ],
        },
      });

      expect(entries).to.eql({
        fs: {
          kind: 'module',
          entries: {
            '@default': {
              kind: 'object',
              description: 'Default export',
              entries: {
                name: { kind: 'member' },
              },
            },
          },
        },
      });
    });

    it('should skip private entities', () => {
      const transformed = t.transform({
        ids: {
          Person: [{}],
        },
        priv: {
          Person: [{ __id: 'Person', __access: 'private' }],
        },
      });

      expect(transformed).to.eql({
        entries: {},
        definitions: {},
      });
    });

    it('should deep merge entities', () => {
      const { entries } = t.transform(
        {
          ids: {
            component: [
              {
                entries: {
                  settings: { type: 'object' },
                },
              },
            ],
            'component.settings': [{ description: 'settings', entries: {} }],
            'component.settings.shape': [{ description: 'shape' }, { type: 'string' }],
          },
          priv: {
            component: [{ __id: 'component', __isEntry: true }],
            'component.settings': [{ __scopeName: 'settings', __memberOf: 'component' }],
            'component.settings.shape': [
              { __scopeName: 'shape', __memberOf: 'component.settings' },
              { __scopeName: 'shape', __memberOf: 'component.settings' },
            ],
          },
        },
        cfg
      );

      expect(entries).to.eql({
        component: {
          entries: {
            settings: {
              description: 'settings',
              type: 'object',
              entries: {
                shape: {
                  description: 'shape',
                  type: 'string',
                },
              },
            },
          },
        },
      });
    });

    it('should merge same entities', () => {
      const { entries, definitions } = t.transform({
        ids: {
          Person: [{ kind: 'class' }, { kind: 'class' }],
          'Person#name': [{ kind: 'function' }],
          'Person#age': [{ kind: 'function' }],
          Vehicle: [{ kind: 'class' }, { kind: 'class' }],
          'Vehicle#color': [{ kind: 'function' }],
          'Vehicle#model': [{ kind: 'function' }],
        },
        priv: {
          Person: [
            { __id: 'Person', __isEntry: true },
            { __id: 'Person', __isEntry: true },
          ],
          'Person#name': [{ __scopeName: 'name', __memberOf: 'Person' }],
          'Person#age': [{ __scopeName: 'age', __memberOf: 'Person' }],
          Vehicle: [{ __id: 'Vehicle' }, { __id: 'Vehicle' }],
          'Vehicle#color': [{ __scopeName: 'color', __memberOf: 'Vehicle' }],
          'Vehicle#model': [{ __scopeName: 'model', __memberOf: 'Vehicle' }],
        },
      });

      expect(entries).to.eql({
        Person: {
          kind: 'class',
          entries: {
            name: {
              kind: 'function',
            },
            age: {
              kind: 'function',
            },
          },
        },
      });
      expect(definitions).to.eql({
        Vehicle: {
          kind: 'class',
          entries: {
            color: {
              kind: 'function',
            },
            model: {
              kind: 'function',
            },
          },
        },
      });
    });
  });

  describe('generate', () => {
    it('spec', () => {
      const doclets = [
        {
          kind: 'module',
          name: 'fs',
          longname: 'module:fs',
        },
        {
          kind: 'member',
          longname: 'def',
          scope: 'inner',
        },
        {
          kind: 'package',
          name: 'api',
          longname: 'does not matter',
          version: '3.7.0',
          licenses: [{ type: 'yes' }],
        },
      ];

      docletMock.withArgs(doclets[0]).returns({
        kind: 'module',
        entries: {},
      });

      docletMock.withArgs(doclets[1]).returns({
        type: 'string',
      });

      const spec = JSON.parse(
        JSON.stringify(
          t.generate({
            data: doclets,
            config: cfg,
            version: 'x.y.z',
          })
        )
      );

      expect(spec).to.eql({
        scriptappy: 'x.y.z',
        info: {
          name: 'api',
          version: '3.7.0',
          license: 'yes',
        },
        entries: {
          fs: { kind: 'module', entries: {} },
        },
        definitions: {
          def: { type: 'string' },
        },
      });
    });

    it('refs', () => {
      const doclets = [
        {
          tags: [{ originalTitle: 'entry', title: 'entry' }],
          kind: 'typedef',
          longname: 'data-source',
        },
        {
          kind: 'typedef',
          longname: 'chart-definition',
        },
        {
          kind: 'typedef',
          name: 'data',
          memberof: 'chart-definition',
          longname: 'chart-definition.data',
        },
      ];

      docletMock.withArgs(doclets[0]).returns({
        kind: 'object',
        entries: {},
      });

      docletMock.withArgs(doclets[1]).returns({
        kind: 'object',
        entries: {},
      });

      docletMock.withArgs(doclets[2]).returns({
        kind: 'array',
        items: { type: 'data-source' },
      });

      const spec = t.generate({
        data: doclets,
        config: cfg,
      });

      expect(spec.entries).to.eql({
        'data-source': { entries: {}, kind: 'object' },
      });

      expect(spec.definitions).to.eql({
        'chart-definition': {
          kind: 'object',
          entries: {
            data: {
              kind: 'array',
              items: {
                type: 'data-source',
              },
            },
          },
        },
      });
    });
  });
});
