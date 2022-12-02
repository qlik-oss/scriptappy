const sort = require('../lib/sort');
const typeParser = require('../lib/type-parser');
const collectNest = require('../lib/collect-nest');
const collect = require('../lib/collector');

jest.mock('../lib/sort');
jest.mock('../lib/type-parser');
jest.mock('../lib/collect-nest');

describe('collector', () => {
  let sandbox;
  let nest;
  let sortObject;
  let getParamFromComment;
  let getPropertyFromComment;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sortObject = sandbox.stub();
    nest = sandbox.stub();
    getParamFromComment = sandbox.stub();
    getPropertyFromComment = sandbox.stub();

    sort.sortObject.mockImplementation(sortObject);
    typeParser.getParamFromComment.mockImplementation(getParamFromComment);
    typeParser.getPropertyFromComment.mockImplementation(getPropertyFromComment);
    collectNest.mockImplementation(nest);
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
    expect(sortObject).to.have.been.calledWithExactly('a', 'cfg');
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
    const doc = { properties: ['p'] };
    nest.withArgs({ doc, list: ['p'] }, 'cfg', 'opts', 'entity').returns({ a: 'x' });
    const c = collect({ entity: 'entity' });
    const props = c.collectPropsFromDoc(doc, 'cfg', 'opts');
    expect(props).to.eql({ a: 'x' });
    expect(sortObject).to.have.been.calledWithExactly({ entries: { a: 'x' } }, 'cfg');
  });

  it('should attach exp to props', () => {
    const doc = { properties: [{ name: 'p' }], comment: 'com' };
    getPropertyFromComment.withArgs('p', 'com').returns('expression');
    nest.returns({});
    const c = collect({ entity: 'entity' });
    c.collectPropsFromDoc(doc, 'cfg', 'opts');
    expect(nest.args[0][0].list).to.eql([{ name: 'p', exp: 'expression' }]);
  });
});
