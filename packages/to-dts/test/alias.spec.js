const al = require('../lib/types/alias');

describe('alias', () => {
  it('should create empty', () => {
    const def = { name: 'al', items: 'string' };
    const g = { getType: sinon.stub() };
    g.getType.withArgs('string', { kind: 'alias' }).returns('tt');
    expect(al(def, {}, g)).to.eql({ flags: 0, kind: 'alias', name: 'al', type: 'tt', typeParameters: [] });
  });
});
