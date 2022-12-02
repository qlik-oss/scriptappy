const typeParams = require('../lib/types/type-params');

describe('type params', () => {
  let sandbox;
  beforeAll(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.reset();
  });
  it('should return parameters', () => {
    const g = {
      getType: sandbox.stub(),
    };
    const templates = [{ name: 'T' }, { name: 'K', type: 'string' }, { name: 'U', defaultValue: 'P' }];
    g.getType.withArgs({ name: 'K', type: 'string' }).returns('base');
    g.getType.withArgs({ type: 'P' }).returns('default type P');
    expect(typeParams(templates, false, g)).to.eql([
      {
        kind: 'type-parameter',
        name: 'T',
        defaultType: undefined,
        baseType: undefined,
      },
      {
        kind: 'type-parameter',
        name: 'K',
        defaultType: undefined,
        baseType: 'base',
      },
      {
        kind: 'type-parameter',
        name: 'U',
        defaultType: 'default type P',
        baseType: undefined,
      },
    ]);
  });
});
