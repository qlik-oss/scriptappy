const dom = require('dts-dom');

describe('function', () => {
  let sandbox;
  let fn;
  let params;
  before(() => {
    sandbox = sinon.createSandbox();
    params = sandbox.stub();

    [fn] = aw.mock([['**/*/params.js', () => params]], ['../lib/types/function']);
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should create empty', () => {
    const def = { name: 'foo' };
    params.returns([]);
    const v = fn(def);
    expect(v).to.eql({
      kind: 'function',
      name: 'foo',
      flags: 0,
      parameters: [],
      returnType: 'void',
      typeParameters: [],
    });
  });

  it('should create as method when parent is class, interface or object', () => {
    const def = {};
    params.returns([]);
    ['class', 'interface', 'object'].forEach(p => {
      const v = fn(def, { kind: p });
      expect(v.kind).to.eql('method');
    });
  });

  it('should create as function-type when parent is union, array, parameter or alias', () => {
    const def = {};
    params.returns([]);
    ['union', 'array', 'parameter', 'alias'].forEach(p => {
      const v = fn(def, { kind: p });
      expect(v.kind).to.eql('function-type');
    });
  });

  it('should have params', () => {
    const def = {
      params: 'par',
      this: 'self',
    };
    params.returns(['p']);
    const v = fn(def, {}, 'g');
    expect(params).to.have.been.calledWithExactly('par', 'self', 'g');
    expect(v.parameters).to.eql(['p']);
  });

  it('should have a return type', () => {
    const def = {
      returns: 'ret',
    };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('ret').returns('animal');
    expect(fn(def, {}, g).returnType).to.eql('animal');
  });

  it('should write definition', () => {
    const def = { name: 'meh', params: 'par', returns: 'ret' };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('ret').returns(dom.type.string);
    params.withArgs('par').returns([dom.create.parameter('first', dom.type.boolean)]);
    const v = fn(def, {}, g);
    const s = dom.emit(v, { rootFlags: 1 });
    expect(s.trimRight()).to.equal('function meh(first: boolean): string;');
  });
});
