const arr = require('../lib/types/array');

describe('array', () => {
  let sandbox;
  beforeAll(() => {
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
    g.getType.withArgs('its', { kind: 'array' }).returns('s');
    expect(arr({ items: 'its' }, false, g)).to.eql({
      kind: 'array',
      type: 's',
    });
  });

  it('should create tuple', () => {
    const g = { getType: sandbox.stub() };
    g.getType.withArgs('first', { kind: 'array' }).returns('string');
    g.getType.withArgs('2nd', { kind: 'array' }).returns('boolean | number');
    expect(arr({ items: ['first', '2nd'] }, false, g)).to.eql('[string, boolean | number]');
  });
});
