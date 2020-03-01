describe('check-types', () => {
  let t;
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
    [t] = aw.mock([['**/types.js', () => ['mine']]], ['../src/check-types']);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should rewrite types', () => {
    const cfg = {
      logRule() {
        throw new Error('oops');
      },
      parse: {
        types: {
          Carr: {
            rewrite: 'car',
          },
        },
      },
    };

    const obj = {
      c: [{ type: 'Carr' }],
    };

    t(obj, {}, cfg);

    expect(obj.c[0]).to.eql({
      type: 'car',
    });
  });

  it('should rewrite generic types', () => {
    const cfg = {
      logRule() {
        throw new Error('oops');
      },
      parse: {
        types: {
          Car: {
            rewrite: 'Vehicle',
          },
        },
      },
    };

    const obj = {
      a: [{ type: 'Car<x>' }],
    };

    t(obj, {}, cfg);

    expect(obj.a[0]).to.eql({
      type: 'Vehicle<x>',
    });
  });

  it('should rewrite to existing ref', () => {
    const cfg = {
      logRule() {
        throw new Error('oops');
      },
    };

    const obj = {
      a: [{ type: 'Car' }],
    };

    t(
      obj,
      {
        Car: [{ __ref: '#/def/Car' }],
      },
      cfg
    );

    expect(obj.a[0]).to.eql({
      type: '#/def/Car',
    });
  });

  it('should not log for known types', () => {
    const cfg = {
      logRule(a, b, c) {
        throw new Error(c);
      },
      parse: { types: {} },
    };

    [
      // primitives
      'boolean',
      'number',
      'string',
      'function',
      'object',
      'array',
      'any',
      'null',
      'symbol',
      'undefined',
      // custom types
      'mine',
      // template
      'T',
      // native
      'Math',
    ].forEach(known => {
      t({ a: { kind: 'interface', templates: [{ name: 'T' }], type: known } }, {}, cfg);
    });
  });

  it('should log for unknown types', () => {
    const cfg = {
      logRule: sandbox.spy(),
      parse: { types: {} },
    };
    t({ a: [{ type: 'meh' }] }, {}, cfg);

    expect(cfg.logRule).to.have.been.calledWithExactly(null, 'no-unknown-types', "Type unknown: 'meh'");
  });
});
