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
