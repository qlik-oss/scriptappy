const event = require('../lib/types/event');
const params = require('../lib/types/params');

jest.mock('../lib/types/params');

describe('event', () => {
  let sandbox;
  let paramsMock;
  let g;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    paramsMock = sandbox.stub();
    params.mockImplementation(paramsMock);
    g = {
      getType: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should call getType with event definition', () => {
    const def = { params: 'p', desc: 'd', name: 'closed' };
    paramsMock.returns([]);
    g.getType.returns({ parameters: [] });
    event(def, 'parent', g);
    expect(g.getType).to.have.been.calledWithExactly(
      {
        desc: 'd',
        name: 'on',
        params: [{ name: 'event', kind: 'literal', value: 'closed' }],
        kind: 'function',
      },
      'parent'
    );
  });

  it('should create with listener', () => {
    const def = { params: 'p' };
    paramsMock.withArgs('p', false, g).returns([{ name: 'callbackparam' }]);
    g.getType = (d) => ({ parameters: [{ type: `"${d.name}"` }] });

    expect(event(def, 'parent', g)).to.eql({
      parameters: [
        { type: '"on"' },
        {
          flags: 0,
          kind: 'parameter',
          name: 'listener',
          type: {
            kind: 'function-type',
            parameters: [{ name: 'callbackparam' }],
            returnType: 'void',
            typeParameters: [],
          },
        },
      ],
    });
  });
});
