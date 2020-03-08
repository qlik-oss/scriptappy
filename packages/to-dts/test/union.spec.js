const un = require('../lib/types/union');

describe('union', () => {
  it('should create empty', () => {
    const def = { items: ['a', 'b'] };
    const g = { getType: sinon.stub() };
    g.getType.withArgs('a', { kind: 'union' }).returns('-a-');
    g.getType.withArgs('b', { kind: 'union' }).returns('-b-');
    expect(un(def, {}, g)).to.eql({ kind: 'union', members: ['-a-', '-b-'] });
  });
});
