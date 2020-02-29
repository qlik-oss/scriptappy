describe('to-dts', () => {
  let sandbox;
  let traverseFn;
  let typeFn;
  let top;
  let toDts;
  before(() => {
    sandbox = sinon.createSandbox();
    typeFn = sandbox.stub();
    traverseFn = sandbox.stub();
    top = sandbox.stub();

    [toDts] = aw.mock(
      [
        ['**/*/type.js', () => typeFn],
        ['**/*/traverse.js', () => traverseFn],
        ['**/*/top.js', () => top],
      ],
      ['../lib/']
    );
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should initiate g', () => {
    const trav = () => [];
    typeFn.withArgs({ specification: 'spec' }).returns('getT');
    traverseFn.withArgs({ specification: 'spec', getType: 'getT' }).returns(trav);

    top.withArgs('spec', { umd: undefined, export: undefined }).returns({
      types: [],
    });

    toDts('spec');

    expect(traverseFn.args[0]).to.eql([
      {
        getType: 'getT',
        specification: 'spec',
        traverse: trav,
      },
    ]);
  });

  it('should return entries', () => {
    const spec = { entries: 'entr' };

    top.withArgs(spec, { umd: undefined, export: undefined }).returns({
      types: [],
      entriesRoot: 'p',
      entriesFlags: 16,
    });

    const trav = sandbox.stub();
    trav.withArgs('entr', { parent: 'p', path: '#/entries', flags: 16 }).returns(['iface']);
    trav.onCall(1).returns([]);
    traverseFn.returns(trav);

    const v = toDts(spec);

    expect(v).to.eql(`p\r\niface\r\n`);
  });

  it('should return definitions', () => {
    const spec = { definitions: 'defs' };

    top.withArgs(spec, { umd: undefined, export: undefined }).returns({
      types: [],
      definitionsRoot: 'defP',
      flags: 0,
    });

    const trav = sandbox.stub();
    trav.onCall(0).returns([]);
    trav.withArgs('defs', { parent: 'defP', path: '#/definitions', flags: 0 }).returns(['idef']);
    traverseFn.returns(trav);

    const v = toDts(spec);

    expect(v).to.eql('defP\r\nidef\r\n');
  });

  it('should set namespace on g when definitions root != entriesRoot', () => {
    const spec = { definitions: 'defs' };

    top.returns({
      types: [],
      definitionsRoot: { kind: 'namespace', name: 'dns', members: [] },
      flags: 0,
    });

    const trav = sandbox.stub();
    trav.returns([]);
    traverseFn.returns(trav);

    toDts(spec);

    expect(traverseFn.args[0][0].namespace).to.eql('dns');
  });
});
