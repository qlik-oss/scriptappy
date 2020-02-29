const un = require('../lib/types/union');

describe('union', () => {
  it('should create empty', () => {
    const def = { items: ['a', 'b'] };
    const g = { getType: v => `-${v}-` };
    expect(un(def, {}, g)).to.eql({ kind: 'union', members: ['-a-', '-b-'] });
  });
});
