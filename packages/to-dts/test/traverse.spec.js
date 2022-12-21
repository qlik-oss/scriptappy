const traverseFn = require('../lib/traverse');

const VALID_MEMBERS = {
  class: ['property', 'method', 'index-signature', 'constructor'],
  enum: ['enum-value'],
  module: ['interface', 'alias', 'class', 'namespace', 'const', 'var', 'function'],
  namespace: ['interface', 'alias', 'class', 'namespace', 'const', 'var', 'function', 'enum'],
  interface: ['property', 'method', 'index-signature', 'call-signature'],
  object: ['property', 'method', 'index-signature', 'call-signature'],
};

describe('traverse', () => {
  let sandbox;
  let g;
  let traverse;
  beforeAll(() => {
    sandbox = sinon.createSandbox();
    g = {
      getType: sandbox.stub(),
    };
    g.traverse = traverseFn(g);
    traverse = g.traverse;
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should return the type when it has no parent', () => {
    const obj = {
      animal: {
        type: 'fn',
      },
    };
    g.getType.withArgs({ name: 'animal', path: '#/a/animal', ...obj.animal }).returns({ kind: 'const' });
    const v = traverse(obj, { path: '#/a' });
    expect(v).to.eql([{ kind: 'const' }]);
  });

  it('should amend flags', () => {
    const obj = {
      animal: {
        type: 'fn',
      },
    };
    g.getType.withArgs({ name: 'animal', path: '#/a/animal', ...obj.animal }).returns({ kind: 'const', flags: 4 });
    const v = traverse(obj, { path: '#/a', flags: 2 });
    expect(v).to.eql([{ kind: 'const', flags: 6 }]);
  });

  it('should alias the type when its kind is not allowed at top level', () => {
    const obj = {
      animal: {
        type: 'string',
      },
    };
    g.getType.withArgs({ name: 'animal', path: '#/a/animal', ...obj.animal }).returns('s');
    const v = traverse(obj, { path: '#/a' });
    expect(v).to.eql([
      {
        flags: 0,
        kind: 'alias',
        name: 'animal',
        type: 's',
        typeParameters: [],
      },
    ]);
  });

  it('should traverse over entries', () => {
    const obj = {
      animal: {
        entries: 'ent',
      },
    };
    const $ = {
      getType: () => 'tst',
      traverse: sandbox.stub(),
    };
    $.traverse.returns(['traversed']);
    const tr = traverseFn($);
    const v = tr(obj, { path: '#/a' });
    expect($.traverse).to.have.been.calledWithExactly('ent', { parent: 'tst', path: '#/a/animal/entries', flags: 0 });
    expect(v).to.eql([
      {
        flags: 0,
        kind: 'alias',
        name: 'animal',
        type: 'tst',
        typeParameters: [],
      },
      'traversed',
    ]);
  });

  it('should traverse over static entries', () => {
    const obj = {
      animal: {
        staticEntries: 'ent',
      },
    };
    const $ = {
      getType: () => 'tst',
      traverse: sandbox.stub(),
    };
    $.traverse.returns(['traversed']);
    const tr = traverseFn($);
    const v = tr(obj, { path: '#/a' });
    expect($.traverse).to.have.been.calledWithExactly('ent', {
      parent: 'tst',
      path: '#/a/animal/staticEntries',
      flags: 4,
    });
    expect(v).to.eql([
      {
        flags: 0,
        kind: 'alias',
        name: 'animal',
        type: 'tst',
        typeParameters: [],
      },
      'traversed',
    ]);
  });

  it('should traverse over definitions with a namespace as parent', () => {
    const obj = {
      animal: {
        definitions: 'ent',
      },
    };
    const $ = {
      getType: () => 'tst',
      traverse: sandbox.stub(),
    };
    $.traverse.returns(['traversed']);
    const tr = traverseFn($);
    const v = tr(obj, { path: '#/a' });
    expect($.traverse).to.have.been.calledWithExactly('ent', {
      parent: { kind: 'namespace', name: 'animal', members: [] },
      path: '#/a/animal/definitions',
      flags: 0,
    });
    expect(v).to.eql([
      {
        flags: 0,
        kind: 'alias',
        name: 'animal',
        type: 'tst',
        typeParameters: [],
      },
      { kind: 'namespace', name: 'animal', members: [] },
      'traversed',
    ]);
  });

  it('should attach definitions namespace to parent', () => {
    const obj = {
      animal: {
        definitions: 'ent',
      },
    };
    const $ = {
      getType: () => 'tst',
      traverse: sandbox.stub(),
    };
    $.traverse.returns(['traversed']);
    const tr = traverseFn($);
    const tsParent = { members: [], kind: 'module' };
    const v = tr(obj, { parent: tsParent, path: '#/a' });
    expect($.traverse).to.have.been.calledWithExactly('ent', {
      parent: { kind: 'namespace', name: 'animal', members: [] },
      path: '#/a/animal/definitions',
      flags: 0,
    });
    expect(v).to.eql(['traversed']);
    expect(tsParent.members).to.eql([
      {
        flags: 0,
        kind: 'alias',
        name: 'animal',
        type: 'tst',
        typeParameters: [],
      },
      { kind: 'namespace', name: 'animal', members: [] },
    ]);
  });

  describe('with parent', () => {
    Object.keys(VALID_MEMBERS).forEach((key) => {
      describe(`of type ${key} should add valid member`, () => {
        VALID_MEMBERS[key].forEach((mt) => {
          it(`${mt}`, () => {
            const tsParent = { kind: key, members: [] };
            const def = { type: `$${key}:${mt}`, optional: true };
            g.getType.withArgs({ name: 'animal', path: '/animal', ...def }).returns({ kind: mt });
            traverse(
              {
                animal: def,
              },
              { parent: tsParent, path: '' }
            );
            expect(tsParent.members).to.eql([{ kind: mt, flags: 8 }]);
          });
        });
      });
    });

    ['class', 'interface', 'object'].forEach((key) => {
      it(`of type ${key} should add property member when member type is invalid`, () => {
        const tsParent = { kind: key, members: [] };
        const def = { type: `$${key}:foo`, optional: true };
        g.getType.withArgs({ name: 'animal', path: '/animal', ...def }).returns({ kind: 'foo' });
        traverse(
          {
            animal: def,
          },
          { parent: tsParent, path: '' }
        );
        expect(tsParent.members).to.eql([{ flags: 8, kind: 'property', name: 'animal', type: { kind: 'foo' } }]);
      });
    });

    ['module', 'namespace'].forEach((key) => {
      it(`of type ${key} should add aliased member when other types are invalid`, () => {
        const tsParent = { kind: key, members: [] };
        const def = { type: `$${key}:foo`, optional: true };
        g.getType.withArgs({ name: 'animal', path: '/animal', ...def }).returns({ kind: 'foo' });
        traverse(
          {
            animal: def,
          },
          { parent: tsParent, path: '' }
        );
        expect(tsParent.members).to.eql([
          { flags: 8, kind: 'alias', name: 'animal', type: { kind: 'foo' }, typeParameters: [] },
        ]);
      });
    });

    it('should use type insection for type inheritance', () => {
      const tsParent = { kind: 'namespace', members: [] };
      const def = { kind: 'object', extends: [{ type: '/animal' }] };
      g.getType.withArgs({ name: 'mammoth', path: '/mammoth', ...def }).returns({ kind: 'object', name: 'mammoth' });
      g.getType.withArgs({ type: '/animal' }).returns({ kind: 'object', name: 'animal' });
      traverse({ mammoth: def }, { parent: tsParent, path: '' });
      expect(tsParent.members).to.eql([
        {
          kind: 'alias',
          name: 'mammoth',
          type: {
            kind: 'intersection',
            members: [
              { kind: 'object', name: 'animal' },
              { kind: 'object', name: 'mammoth' },
            ],
          },
          typeParameters: [],
          flags: 0,
        },
      ]);
    });
  });
});
