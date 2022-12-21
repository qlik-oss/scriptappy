const typeFn = require('../lib/type');
const arr = require('../lib/types/array');
const fn = require('../lib/types/function');
const iface = require('../lib/types/interface');
const alias = require('../lib/types/alias');
const klass = require('../lib/types/class');
const enm = require('../lib/types/enum');
const reference = require('../lib/types/reference');
const union = require('../lib/types/union');
const event = require('../lib/types/event');
const typeParams = require('../lib/types/type-params');
const comments = require('../lib/comments');

jest.mock('../lib/types/array');
jest.mock('../lib/types/function');
jest.mock('../lib/types/interface');
jest.mock('../lib/types/alias');
jest.mock('../lib/types/class');
jest.mock('../lib/types/enum');
jest.mock('../lib/types/reference');
jest.mock('../lib/types/union');
jest.mock('../lib/types/event');
jest.mock('../lib/types/type-params');
jest.mock('../lib/comments');

describe('type', () => {
  let sandbox;
  let getType;
  let arrMock;
  let fnMock;
  let ifaceMock;
  let aliasMock;
  let enmMock;
  let klassMock;
  let referenceMock;
  let unionMock;
  let eventMock;
  let typeParamsMock;
  let commentsMock;
  let g;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    arrMock = sandbox.stub();
    fnMock = sandbox.stub();
    ifaceMock = sandbox.stub();
    aliasMock = sandbox.stub();
    enmMock = sandbox.stub();
    klassMock = sandbox.stub();
    referenceMock = sandbox.stub();
    unionMock = sandbox.stub();
    eventMock = sandbox.stub();
    typeParamsMock = sandbox.stub();
    commentsMock = sandbox.stub();

    arr.mockImplementation(arrMock);
    fn.mockImplementation(fnMock);
    iface.mockImplementation(ifaceMock);
    alias.mockImplementation(aliasMock);
    enm.mockImplementation(enmMock);
    klass.mockImplementation(klassMock);
    reference.mockImplementation(referenceMock);
    union.mockImplementation(unionMock);
    event.mockImplementation(eventMock);
    typeParams.mockImplementation(typeParamsMock);
    comments.mockImplementation(commentsMock);

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
    referenceMock.withArgs(def.type).returns('ref');
    expect(getType(def)).to.eql('ref');
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

  it('should create alias', () => {
    const def = { kind: 'alias' };
    aliasMock.withArgs(def, 'p', g).returns('a');
    expect(getType(def, 'p')).to.eql('a');
  });

  it('should create class', () => {
    const def = { kind: 'class' };
    klassMock.withArgs(def, 'p', g).returns('k');
    expect(getType(def, 'p')).to.eql('k');
  });

  it('should create enum', () => {
    const def = { kind: 'enum' };
    enmMock.withArgs(def, 'p', g).returns('ee');
    expect(getType(def, 'p')).to.eql('ee');
  });

  it('should create enum value', () => {
    const def = { name: 'CODE', value: 'v' };
    expect(getType(def, { kind: 'enum' })).to.eql({
      name: 'CODE',
      kind: 'enum-value',
      value: 'v',
    });
  });

  it('should create function', () => {
    const def = { kind: 'function' };
    fnMock.withArgs(def, 'p', g).returns('f');
    expect(getType(def, 'p')).to.eql('f');
  });

  it('should create interface', () => {
    const def = { kind: 'interface' };
    ifaceMock.withArgs(def, 'p', g).returns('i');
    expect(getType(def, 'p')).to.eql('i');
  });

  it('should create array', () => {
    const def = { kind: 'array' };
    arrMock.withArgs(def, 'p', g).returns('a');
    expect(getType(def, 'p')).to.eql('a');
  });

  it('should create union', () => {
    const def = { kind: 'union' };
    unionMock.withArgs(def, 'p', g).returns('u');
    expect(getType(def, 'p')).to.eql('u');
  });

  it('should create event', () => {
    const def = { kind: 'event' };
    eventMock.withArgs(def, 'p', g).returns('e');
    expect(getType(def, 'p')).to.eql('e');
  });

  it('should create literal', () => {
    const def = { kind: 'literal', value: 'v' };
    expect(getType(def, 'p')).to.eql({
      kind: 'string-literal',
      value: 'v',
    });
  });

  it("should strip single quotes (') from literals", () => {
    const def = { kind: 'literal', value: "'v'" };
    expect(getType(def, 'p')).to.eql({ kind: 'string-literal', value: 'v' });
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
      (prim) => {
        const def = { type: prim };
        expect(getType(def, 'p')).to.eql(prim);
      }
    );
  });

  it('should create value (`const name: type`) for known ts type in api entries', () => {
    ['string', 'number', 'boolean', 'any', 'void', 'object', 'null', 'undefined', 'true', 'false', 'this'].forEach(
      (prim) => {
        const def = { type: prim, name: 'version', path: '#/entries/embed' };
        expect(getType(def)).to.eql({
          kind: 'const',
          name: 'version',
          type: prim,
          flags: 0,
        });
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
    fnMock.withArgs(def, 'p', g).returns({ typeParameters: [] });
    typeParamsMock.withArgs('temps', { typeParameters: [] }, g).returns(['template params']);
    expect(getType(def, 'p')).to.eql({
      typeParameters: ['template params'],
    });
  });

  it('should add jsdoc comment', () => {
    const def = { kind: 'function' };
    const t = { kind: 'foo' };
    fnMock.returns(t);
    commentsMock.withArgs(def, t).returns('c');
    expect(getType(def, 'p')).to.eql({
      kind: 'foo',
      jsDocComment: 'c',
    });
  });
});
