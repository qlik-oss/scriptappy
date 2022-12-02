const toDts = require('../lib');
const type = require('../lib/type');
const traverse = require('../lib/traverse');
const top = require('../lib/top');

jest.mock('../lib/type');
jest.mock('../lib/traverse');
jest.mock('../lib/top');

describe('to-dts', () => {
  let sandbox;
  let typeMock;
  let traverseMock;
  let topMock;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    typeMock = sandbox.stub();
    traverseMock = sandbox.stub();
    topMock = sandbox.stub();

    type.mockImplementation(typeMock);
    traverse.mockImplementation(traverseMock);
    top.mockImplementation(topMock);
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should initiate g', () => {
    const trav = () => [];
    typeMock.withArgs({ specification: 'spec' }).returns('getT');
    traverseMock.withArgs({ specification: 'spec', getType: 'getT' }).returns(trav);

    topMock.withArgs('spec').returns({ types: [] });

    toDts('spec');

    expect(traverseMock.args[0]).to.eql([
      {
        getType: 'getT',
        specification: 'spec',
        traverse: trav,
      },
    ]);
  });

  it('should return entries', () => {
    const spec = { entries: 'entr' };

    topMock.withArgs(spec).returns({
      types: [],
      entriesRoot: 'p',
      entriesFlags: 16,
    });

    const trav = sandbox.stub();
    trav.withArgs('entr', { parent: 'p', path: '#/entries', flags: 16 }).returns(['iface']);
    trav.onCall(1).returns([]);
    traverseMock.returns(trav);

    const v = toDts(spec);

    expect(v).to.eql(`p\r\niface\r\n`);
  });

  it('should return definitions', () => {
    const spec = { definitions: 'defs' };

    topMock.withArgs(spec).returns({
      types: [],
      definitionsRoot: 'defP',
      flags: 0,
    });

    const trav = sandbox.stub();
    trav.onCall(0).returns([]);
    trav.withArgs('defs', { parent: 'defP', path: '#/definitions', flags: 0 }).returns(['idef']);
    traverseMock.returns(trav);

    const v = toDts(spec);

    expect(v).to.eql('defP\r\nidef\r\n');
  });

  it('should set namespace on g when definitions root != entriesRoot', () => {
    const spec = { definitions: 'defs' };

    topMock.returns({
      types: [],
      definitionsRoot: { kind: 'namespace', name: 'dns', members: [] },
      flags: 0,
    });

    const trav = sandbox.stub();
    trav.returns([]);
    traverseMock.returns(trav);

    toDts(spec);

    expect(traverseMock.args[0][0].namespace).to.eql('dns');
  });
});
