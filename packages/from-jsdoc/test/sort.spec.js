const { sortObject } = require('../lib/sort');

describe('sort', () => {
  ['entries', 'staticEntries', 'definitions', 'events'].forEach(subentry => {
    it(`of ${subentry} should be alphabetical`, () => {
      const t = {
        [subentry]: { b: {}, d: {}, a: {} },
      };
      sortObject(t, { output: { sort: { alpha: true } } });
      expect(Object.keys(t[subentry])).to.eql(['a', 'b', 'd']);
    });
  });

  it('of optional properties should place last', () => {
    const t = {
      entries: { c: {}, d: { optional: true }, a: { optional: true }, b: {} },
    };
    sortObject(t, { output: { sort: { alpha: true } } });
    expect(Object.keys(t.entries)).to.eql(['b', 'c', 'a', 'd']);
  });
});
