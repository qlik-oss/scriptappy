const dom = require('dts-dom');
const fn = require('../lib/types/function');
const params = require('../lib/types/params');

jest.mock('../lib/types/params');

describe('function', () => {
  let sandbox;
  let paramsMock;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    paramsMock = sandbox.stub();
    params.mockImplementation(paramsMock);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should create empty', () => {
    const def = { name: 'foo' };
    paramsMock.returns([]);
    const v = fn(def);
    expect(v).to.eql({
      kind: 'alias',
      name: 'foo',
      flags: 0,
      type: {
        kind: 'function-type',
        parameters: [],
        returnType: 'void',
        typeParameters: [],
      },
      typeParameters: [],
    });
  });

  it('should create as method when parent is class, interface or object', () => {
    const def = {};
    paramsMock.returns([]);
    ['class', 'interface', 'object'].forEach((p) => {
      const v = fn(def, { kind: p });
      expect(v.kind).to.eql('method');
    });
  });

  it('should create as function-type when parent is union, array, parameter or alias', () => {
    const def = {};
    paramsMock.returns([]);
    ['union', 'array', 'parameter', 'alias'].forEach((p) => {
      const v = fn(def, { kind: p });
      expect(v.kind).to.eql('function-type');
    });
  });

  it('should create as function for api entry', () => {
    const def = {};
    paramsMock.returns([]);
    const type = fn(def, { kind: 'namespace' }, {}, true);
    expect(type.kind).to.eql('function');
  });

  it('should have params', () => {
    const def = {
      params: 'par',
      this: 'self',
    };
    paramsMock.returns(['p']);
    const v = fn(def, {}, 'g');
    expect(paramsMock).to.have.been.calledWithExactly('par', 'self', 'g');
    expect(v.type.parameters).to.eql(['p']);
  });

  it('should have a return type', () => {
    const def = {
      returns: 'ret',
    };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('ret').returns('animal');
    expect(fn(def, {}, g).type.returnType).to.eql('animal');
  });

  it('should write definition', () => {
    const def = { name: 'meh', params: 'par', returns: 'ret' };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('ret').returns(dom.type.string);
    paramsMock.withArgs('par').returns([dom.create.parameter('first', dom.type.boolean)]);
    const v = fn(def, {}, g);
    const s = dom.emit(v, { rootFlags: 1 });
    expect(s.trimRight()).to.equal('type meh = (first: boolean)=>string;');
  });
});
