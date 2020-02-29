const arr = require('../lib/types/array');

describe('array', () => {
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should create with "any" type', () => {
    expect(arr({})).to.eql({
      kind: 'array',
      type: 'any',
    });
  });

  it('should create with same type', () => {
    const g = { getType: sandbox.stub() };
    g.getType.withArgs('its').returns('s');
    expect(arr({ items: 'its' }, {}, g)).to.eql({
      kind: 'array',
      type: 's',
    });
  });
});
