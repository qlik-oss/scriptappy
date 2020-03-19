const types = require('../lib/types');

describe('types', () => {
  let t;
  const spec = {
    entries: {
      dude: {
        type: '#/definitions/Person',
      },
    },
    definitions: {
      Person: {
        kind: 'class',
      },
      Car: {
        kind: 'class',
      },
    },
  };
  beforeEach(() => {
    t = types(spec);
  });

  it('should return internal type "[Person]"', () => {
    expect(
      t.getType({
        ...spec.entries.dude,
        name: 'dude',
      })
    ).to.equal('[Person]');
  });

  it('should return known data structure', () => {
    expect(
      t.getType({
        kind: 'boolean',
      })
    ).to.equal('[boolean]');
    expect(
      t.getType({
        kind: 'string',
      })
    ).to.equal('[string]');
    expect(
      t.getType({
        kind: 'number',
      })
    ).to.equal('[number]');

    expect(
      t.getType({
        kind: 'class',
      })
    ).to.equal('[class]');
  });

  it('should return known builtin object', () => {
    expect(
      t.getType({
        kind: 'function',
      })
    ).to.equal('[Function]');

    expect(
      t.getType({
        kind: 'RangeError',
      })
    ).to.equal('[RangeError]');

    expect(
      t.getType({
        kind: 'object',
      })
    ).to.equal('[Object]');

    expect(
      t.getType({
        kind: 'math',
      })
    ).to.equal('[Math]');
  });

  it('should return simple unknown type', () => {
    expect(
      t.getType({
        kind: 'foo',
      })
    ).to.equal('`foo`');
  });

  it('should prefix ... for variable type', () => {
    expect(t.getType({ type: 'unknown', variable: true })).to.equal('`...unknown`');
    expect(t.getType({ type: 'boolean', variable: true })).to.equal('...[boolean]');
    expect(t.getType({ type: '#/foo', variable: true })).to.equal('`...#/foo`');
    expect(t.getType({ type: '#/definitions/Person', variable: true })).to.equal('...[Person]');
  });

  it('should prefix ? for nullable type', () => {
    expect(t.getType({ type: 'unknown', nullable: true })).to.equal('`?unknown`');
    expect(t.getType({ type: 'boolean', nullable: true })).to.equal('?[boolean]');
    expect(t.getType({ type: '#/foo', nullable: true })).to.equal('`?#/foo`');
    expect(t.getType({ type: '#/definitions/Person', nullable: true })).to.equal('?[Person]');
  });

  it('should prefix ...? for nullable variable type', () => {
    expect(t.getType({ type: 'boolean', nullable: true, variable: true })).to.equal('...?[boolean]');
  });

  it('should return internal references with assigned slugs', () => {
    t.assignSlug(
      {
        path: '#/definitions/Person',
      },
      '#class-person'
    );

    t.assignSlug(
      {
        path: '#/definitions/Car',
      },
      '#class-car'
    );

    t.getType({
      type: '#/definitions/Person',
    });

    expect(t.getReferences()).to.eql([{ key: 'Person', link: '#class-person' }]);
  });

  it('should return builtin references', () => {
    t.getType({
      type: 'Set',
    });

    t.getType({
      type: 'syntaxError',
    });

    expect(t.getReferences()).to.eql([
      { key: 'Set', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set' },
      {
        key: 'SyntaxError',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError',
      },
    ]);
  });

  it('should return custom references', () => {
    t = types(spec, tt => {
      if (tt === 'Animal') {
        return { url: 'the farm' };
      }
      return undefined;
    });
    t.getType({
      type: 'Animal',
    });

    expect(t.getReferences()).to.eql([{ key: 'Animal', link: 'the farm' }]);
  });
});
