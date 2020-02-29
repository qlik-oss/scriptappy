describe('class', () => {
  let sandbox;
  let klass;
  let params;
  before(() => {
    sandbox = sinon.createSandbox();
    params = sandbox.stub();

    [klass] = aw.mock([['**/*/params.js', () => params]], ['../lib/types/class']);
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should create empty', () => {
    const def = { name: 'foo' };
    params.returns([]);
    const v = klass(def);
    expect(v).to.eql({
      kind: 'class',
      name: 'foo',
      flags: 0,
      implements: [],
      typeParameters: [],
      members: [],
    });
  });

  it('should create with constructor', () => {
    const def = {
      name: 'foo',
      constructor: {
        params: 'par',
      },
    };
    params.withArgs('par', false, 'g').returns(['para']);
    const v = klass(def, {}, 'g');
    expect(v).to.eql({
      kind: 'class',
      name: 'foo',
      flags: 0,
      implements: [],
      typeParameters: [],
      members: [
        {
          kind: 'constructor',
          flags: 0,
          parameters: ['para'],
        },
      ],
    });
  });

  it('should extend from one type', () => {
    const def = { name: 'Dog', extends: ['Animal', 'Mammal'] };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('Animal').returns('Anim');
    const v = klass(def, false, g);
    expect(v).to.eql({
      kind: 'class',
      name: 'Dog',
      flags: 0,
      implements: [],
      typeParameters: [],
      members: [],
      baseType: 'Anim',
    });
  });

  it('should implements from multiple type', () => {
    const def = { name: 'Car', implements: ['Startable', 'Stoppable'] };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('Startable').returns('Start');
    g.getType.withArgs('Stoppable').returns('Stop');
    const v = klass(def, false, g);
    expect(v).to.eql({
      kind: 'class',
      name: 'Car',
      flags: 0,
      implements: ['Start', 'Stop'],
      typeParameters: [],
      members: [],
    });
  });
});
