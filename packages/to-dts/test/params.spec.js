const dom = require('dts-dom');

const params = require('../lib/types/params');

describe('params', () => {
  let sandbox;
  let getType;
  let g;
  before(() => {
    sandbox = sinon.createSandbox();
    getType = sandbox.stub();
    g = {
      getType,
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should write definition', () => {
    const p = { name: 'a', variable: true, optional: true };
    const p2 = { name: 'b', variable: true };
    getType.withArgs(p).returns(dom.type.any);
    getType.withArgs(p2).returns(dom.type.number);
    getType.withArgs('ctx').returns(dom.type.string);

    const v = params([p, p2], 'ctx', g);
    const fn = dom.create.function('foo', v, dom.type.void);
    const s = dom.emit(fn);
    expect(s.trimRight()).to.equal('declare function foo(this: string, a?: any, ...b: number): void;');
  });

  it('should return simple parameter', () => {
    const p = { name: 'a' };
    getType.withArgs(p).returns('tt');
    const v = params([p], false, g);
    expect(v).to.eql([{ kind: 'parameter', name: 'a', type: 'tt', flags: 0 }]);
  });

  it('should add parameter name when misskng', () => {
    const p = {};
    getType.withArgs(p, { kind: 'parameter' }).returns('tt');
    const v = params([p], false, g);
    expect(v).to.eql([{ kind: 'parameter', name: '$', type: 'tt', flags: 0 }]);
  });

  it('should add optional flag', () => {
    const p = { name: 'a', optional: true };
    getType.withArgs(p).returns('tt');
    const v = params([p], false, g);
    expect(v).to.eql([{ kind: 'parameter', name: 'a', type: 'tt', flags: 1 }]);
  });

  it('should add rest flag', () => {
    const p = { name: 'a', variable: true };
    getType.withArgs(p).returns('tt');
    const v = params([p], false, g);
    expect(v).to.eql([{ kind: 'parameter', name: 'a', type: 'tt', flags: 2 }]);
  });

  it("should add 'this' context", () => {
    const context = 'c';
    getType.withArgs(context).returns('ctx');
    const v = params([], context, g);
    expect(v).to.eql([{ kind: 'parameter', name: 'this', type: 'ctx', flags: 0 }]);
  });

  it("should add 'this' context with params", () => {
    const p = { name: 'a', variable: true };
    const context = 'c';
    getType.withArgs(p).returns('tt');
    getType.withArgs(context).returns('ctx');
    const v = params([p], context, g);
    expect(v).to.eql([
      { kind: 'parameter', name: 'this', type: 'ctx', flags: 0 },
      { kind: 'parameter', name: 'a', type: 'tt', flags: 2 },
    ]);
  });

  it('should attach description', () => {
    const p = { name: 'a', description: 'desc' };
    getType.withArgs(p).returns('tt');
    const v = params([p], false, g);
    expect(v).to.eql([{ kind: 'parameter', name: 'a', type: 'tt', flags: 0, _description: 'desc' }]);
  });
});
