const t = require('../src/transformer');

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
    const doclets = [
      { kind: 'package' },
    ];

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
    const doclets = [
      { longname: 'f', kind: 'member' },
    ];

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
    t.logRule({
      logger: {},
      parse: {
        types: {},
        rules: {
          'my-rule': 2,
        },
      },
    }, doc, 'my-rule', 'oops', violations);

    expect(violations).eql({
      'a/b': [{
        doc,
        message: 'oops',
        rule: 'my-rule',
        severity: 2,
      }],
    });
  });

  it('should not log with severity <= 0', () => {
    const violations = {};
    t.logRule({
      logger: {},
      parse: {
        types: {},
        rules: {
          'my-rule': 0,
        },
      },
    }, {}, 'my-rule', 'oops', violations);

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
        'module:fs.name': [{
          __id: 'module:fs.name',
          __scopeName: 'name',
          __memberOf: 'module:fs',
          __meta: { code: { name: '' } },
        }],
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

  it('should rewrite types', () => {
    const transformed = t.transform({
      ids: {
        c: [{ type: 'Carr' }],
      },
      priv: {
        c: [{ __id: 'cc' }],
      },
    }, cfg);

    expect(transformed.definitions.cc).to.eql({
      type: 'car',
    });
  });

  it('should deep merge entities', () => {
    const { entries } = t.transform({
      ids: {
        component: [{
          entries: {
            settings: { type: 'object' },
          },
        }],
        'component.settings': [{ description: 'settings', entries: {} }],
        'component.settings.shape': [{ description: 'shape' }, { type: 'string' }],
      },
      priv: {
        component: [{ __id: 'component', __isEntry: true }],
        'component.settings': [{ __scopeName: 'settings', __memberOf: 'component' }],
        'component.settings.shape': [{ __scopeName: 'shape', __memberOf: 'component.settings' }, { __scopeName: 'shape', __memberOf: 'component.settings' }],
      },
    }, cfg);

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

  it('should sort entries alphabetically', () => {
    const { entries } = t.transform({
      ids: {
        B: [{
          entries: {
            d: { type: 'object' },
            c: { type: 'object' },
          },
        }],
        'B.d': [{ description: 'd', entries: {} }],
        'B.c': [{ description: 'c', entries: {} }],
        A: [{
          entries: {
            b: { type: 'object' },
            a: { type: 'object' },
          },
        }],
        'A.b': [{ description: 'b', entries: {} }],
        'A.a': [{ description: 'a', entries: {} }],
      },
      priv: {
        A: [{ __id: 'A', __isEntry: true }],
        'A.b': [{ __scopeName: 'b', __memberOf: 'A' }],
        'A.a': [{ __scopeName: 'a', __memberOf: 'A' }],
        B: [{ __id: 'B', __isEntry: true }],
        'B.d': [{ __scopeName: 'd', __memberOf: 'B' }],
        'B.c': [{ __scopeName: 'c', __memberOf: 'B' }],
      },
    }, cfg);

    const topKeys = Object.keys(entries);
    const childKeys = [];
    topKeys.forEach(key => childKeys.push(...Object.keys(entries[key].entries)));

    expect(topKeys).to.eql(['A', 'B'], 'top level entries');
    expect(childKeys).to.eql(['a', 'b', 'c', 'd'], 'child entries');
  });

  it('should sort definitions alphabetically', () => {
    const { definitions } = t.transform({
      ids: {
        B: [{
          entries: {
            d: { type: 'object' },
            c: { type: 'object' },
          },
        }],
        'B.d': [{ description: 'd', entries: {} }],
        'B.c': [{ description: 'c', entries: {} }],
        A: [{
          entries: {
            b: { type: 'object' },
            a: { type: 'object' },
          },
        }],
        'A.b': [{ description: 'b', entries: {} }],
        'A.a': [{ description: 'a', entries: {} }],
      },
      priv: {
        A: [{ __id: 'A' }],
        'A.b': [{ __scopeName: 'b', __memberOf: 'A' }],
        'A.a': [{ __scopeName: 'a', __memberOf: 'A' }],
        B: [{ __id: 'B' }],
        'B.d': [{ __scopeName: 'd', __memberOf: 'B' }],
        'B.c': [{ __scopeName: 'c', __memberOf: 'B' }],
      },
    }, cfg);

    const topKeys = Object.keys(definitions);
    const childKeys = [];
    topKeys.forEach(key => childKeys.push(...Object.keys(definitions[key].entries)));

    expect(topKeys).to.eql(['A', 'B'], 'top level definitions');
    expect(childKeys).to.eql(['a', 'b', 'c', 'd'], 'child entries of definitions');
  });
});

describe('generate', () => {
  it('spec', () => {
    const doclets = [{
      meta: { code: { name: '' } },
      kind: 'module',
      name: 'fs',
      longname: 'module:fs',
    }, {
      meta: { code: { name: '' } },
      kind: 'member',
      type: { names: ['string'] },
      longname: 'def',
      scope: 'inner',
    }, {
      kind: 'package',
      name: 'api',
      longname: 'does not matter',
      version: '3.7.0',
      licenses: [{ type: 'yes' }],
    }];
    const spec = JSON.parse(JSON.stringify(t.generate({
      data: doclets,
      config: cfg,
      version: 'x.y.z',
    })));

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
    const doclets = [{
      meta: { code: { name: '' } },
      tags: [{ originalTitle: 'entry', title: 'entry' }],
      kind: 'typedef',
      type: { names: ['object'] },
      longname: 'data-source',
    }, {
      meta: { code: { name: '' } },
      kind: 'typedef',
      type: { names: ['object'] },
      longname: 'chart-definition',
    }, {
      meta: { code: { name: '' } },
      kind: 'typedef',
      type: { names: ['Array.<data-source>'] },
      name: 'data',
      memberof: 'chart-definition',
      longname: 'chart-definition.data',
    }];
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
              type: '#/entries/data-source',
            },
          },
        },
      },
    });
  });
});
