describe('collector', () => {
  let sandbox;
  let collect;
  let sort;
  let nest;
  let getParamFromComment;
  before(() => {
    sandbox = sinon.createSandbox();
    sort = sandbox.stub();
    nest = sandbox.stub();
    getParamFromComment = sandbox.stub();
    [collect] = aw.mock(
      [
        ['**/sort.js', () => ({ sortObject: sort })],
        ['**/type-parser.js', () => ({ getParamFromComment })],
        ['**/collect-nest.js', () => nest],
      ],
      ['../src/collector']
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('params', () => {
    const doc = { params: ['p'] };
    nest.withArgs({ doc, list: ['p'], asArray: true }, 'cfg', 'opts', 'entity').returns(['a']);
    const c = collect({ entity: 'entity' });
    const params = c.collectParamsFromDoc(doc, 'cfg', 'opts');
    expect(params).to.eql(['a']);
    expect(sort).to.have.been.calledWithExactly('a');
  });

  it('should attach exp to params', () => {
    const doc = { params: [{ name: 'a' }], comment: 'com' };
    const c = collect({ entity: 'entity' });
    getParamFromComment.withArgs('a', 'com').returns('expression');
    nest.returns([]);
    c.collectParamsFromDoc(doc, 'cfg', 'opts');
    expect(nest.args[0][0].list).to.eql([{ name: 'a', exp: 'expression' }]);
  });

  it('props', () => {
    const doc = { properties: 'p' };
    nest.withArgs({ doc, list: 'p' }, 'cfg', 'opts', 'entity').returns({ a: 'x' });
    const c = collect({ entity: 'entity' });
    const props = c.collectPropsFromDoc(doc, 'cfg', 'opts');
    expect(props).to.eql({ a: 'x' });
    expect(sort).to.have.been.calledWithExactly({ entries: { a: 'x' } });
  });
});
