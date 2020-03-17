const en = require('../lib/types/enum');

describe('enum', () => {
  it('should create empty', () => {
    const def = { name: 'ee' };
    expect(en(def)).to.eql({ flags: 0, kind: 'enum', name: 'ee', constant: true, members: [] });
  });
});
