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
    expect(t.getType({
      ...spec.entries.dude,
      name: 'dude',
    })).to.equal('[Person]');
  });

  it('should return simple known kind', () => {
    expect(t.getType({
      kind: 'function',
    })).to.equal('[function]');
  });

  it('should return simple unknown type', () => {
    expect(t.getType({
      kind: 'foo',
    })).to.equal('`foo`');
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
    t.assignSlug({
      path: '#/definitions/Person',
    }, '#class-person');

    t.assignSlug({
      path: '#/definitions/Car',
    }, '#class-car');

    t.getType({
      type: '#/definitions/Person',
    });

    expect(t.getReferences()).to.eql([
      { key: 'Person', link: '#class-person' },
    ]);
  });
});
