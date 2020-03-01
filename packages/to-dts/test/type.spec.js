describe('type', () => {
  let sandbox;
  let getType;
  let arr;
  let fn;
  let iface;
  let klass;
  let reference;
  let union;
  let typeFn;
  let event;
  let typeParams;
  let comments;
  let g;
  before(() => {
    sandbox = sinon.createSandbox();
    arr = sandbox.stub();
    fn = sandbox.stub();
    iface = sandbox.stub();
    klass = sandbox.stub();
    reference = sandbox.stub();
    union = sandbox.stub();
    event = sandbox.stub();
    typeParams = sandbox.stub();
    comments = sandbox.stub();

    [typeFn] = aw.mock(
      [
        ['**/types/array.js', () => arr],
        ['**/types/function.js', () => fn],
        ['**/types/interface.js', () => iface],
        ['**/types/class.js', () => klass],
        ['**/types/reference.js', () => reference],
        ['**/types/union.js', () => union],
        ['**/types/event.js', () => event],
        ['**/types/type-params.js', () => typeParams],
        ['**/comments.js', () => comments],
      ],
      ['../lib/type']
    );
    g = {
      getType: sandbox.stub(),
    };
    getType = typeFn(g);
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should create reference', () => {
    const def = { type: '#/' };
    reference.withArgs(def.type, 'p').returns('ref');
    expect(getType(def, 'p')).to.eql('ref');
  });

  it('should create module', () => {
    const def = { name: 'mod', kind: 'module' };
    const v = getType(def);
    expect(v).to.eql({
      kind: 'module',
      name: 'mod',
      members: [],
    });
  });

  it('should create namespace', () => {
    const def = { name: 'ns', kind: 'namespace' };
    const v = getType(def);
    expect(v).to.eql({
      kind: 'namespace',
      name: 'ns',
      members: [],
    });
  });

  it('should create obj', () => {
    const def = { name: 'o', kind: 'object' };
    const v = getType(def);
    expect(v).to.eql({
      kind: 'object',
      members: [],
    });
  });

  it('should create class', () => {
    const def = { kind: 'class' };
    klass.withArgs(def, 'p', g).returns('k');
    expect(getType(def, 'p')).to.eql('k');
  });

  it('should create function', () => {
    const def = { kind: 'function' };
    fn.withArgs(def, 'p', g).returns('f');
    expect(getType(def, 'p')).to.eql('f');
  });

  it('should create interface', () => {
    const def = { kind: 'interface' };
    iface.withArgs(def, 'p', g).returns('i');
    expect(getType(def, 'p')).to.eql('i');
  });

  it('should create array', () => {
    const def = { kind: 'array' };
    arr.withArgs(def, 'p', g).returns('a');
    expect(getType(def, 'p')).to.eql('a');
  });

  it('should create union', () => {
    const def = { kind: 'union' };
    union.withArgs(def, 'p', g).returns('u');
    expect(getType(def, 'p')).to.eql('u');
  });

  it('should create event', () => {
    const def = { kind: 'event' };
    event.withArgs(def, 'p', g).returns('e');
    expect(getType(def, 'p')).to.eql('e');
  });

  it('should create literal', () => {
    const def = { kind: 'literal', value: 'v' };
    expect(getType(def, 'p')).to.eql('v');
  });

  it('should create function type', () => {
    const def = { type: 'function' };
    g.getType.withArgs('ret').returns('r');
    expect(getType(def, 'p')).to.eql({
      kind: 'function-type',
      parameters: [],
      returnType: 'void',
      typeParameters: [],
    });
  });

  it('should create function type with return type', () => {
    const def = { type: 'function', returns: 'ret' };
    g.getType.withArgs('ret').returns('r');
    expect(getType(def, 'p')).to.eql({
      kind: 'function-type',
      parameters: [],
      returnType: 'r',
      typeParameters: [],
    });
  });

  it('should create indexable object type', () => {
    const def = { type: 'object', generics: ['string', 'b'] };
    g.getType.withArgs('string').returns('str');
    g.getType.withArgs('b').returns('bool');
    expect(getType(def, 'p')).to.eql({
      kind: 'object',
      members: [
        {
          kind: 'index-signature',
          indexType: 'str',
          name: 'index',
          valueType: 'bool',
        },
      ],
    });
  });

  it('should create known ts type', () => {
    ['string', 'number', 'boolean', 'any', 'void', 'object', 'null', 'undefined', 'true', 'false', 'this'].forEach(
      prim => {
        const def = { type: prim };
        expect(getType(def, 'p')).to.eql(prim);
      }
    );
  });

  it('should return named type when type is defined', () => {
    expect(getType({ type: 'meh' }, 'p')).to.eql({
      kind: 'name',
      name: 'meh',
      typeArguments: [],
    });
  });

  it('should return "any" type when type is not defined', () => {
    expect(getType({}, 'p')).to.eql('any');
  });

  it('should create named type with type arguments', () => {
    const def = { type: 'Promise', generics: ['s'] };
    g.getType.withArgs('s').returns('string');
    expect(getType(def, 'p')).to.eql({
      kind: 'name',
      name: 'Promise',
      typeArguments: ['string'],
    });
  });

  it('should attach type parameters', () => {
    const def = {
      kind: 'function',
      templates: 'temps',
    };
    fn.withArgs(def, 'p', g).returns({ typeParameters: [] });
    typeParams.withArgs('temps', { typeParameters: [] }, g).returns(['template params']);
    expect(getType(def, 'p')).to.eql({
      typeParameters: ['template params'],
    });
  });

  it('should add jsdoc comment', () => {
    const def = { kind: 'function' };
    const t = { kind: 'foo' };
    fn.returns(t);
    comments.withArgs(def, t).returns('c');
    expect(getType(def, 'p')).to.eql({
      kind: 'foo',
      jsDocComment: 'c',
    });
  });
});
