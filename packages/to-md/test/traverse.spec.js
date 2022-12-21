const traverse = require('../lib/traverse');

describe('traverse', () => {
  let entry;
  let helpers = {};
  beforeEach(() => {
    entry = sinon.spy();
    helpers = {
      entry,
    };
  });

  ['staticEntries', 'entries', 'events', 'definitions'].forEach((prop) => {
    it(`should traverse ${prop}`, () => {
      const root = {
        [prop]: {
          A: { foo: 'a' },
          B: {},
        },
      };
      traverse(root, undefined, helpers);
      expect(entry.callCount).to.equal(2);
      expect(entry.getCall(0)).to.have.been.calledWithExactly(
        {
          name: 'A',
          foo: 'a',
          path: `#/${prop}/A`,
        },
        {
          depth: 0,
          indent: 0,
          parent: root,
        },
        helpers
      );
    });
  });

  it('should traverse constructor', () => {
    const root = {
      name: 'Bike',
      constructor: {
        params: 'p',
      },
    };
    traverse(
      root,
      {
        depth: 3,
        indent: 2,
      },
      helpers
    );
    expect(entry.getCall(0)).to.have.been.calledWithExactly(
      {
        name: 'Bike',
        params: 'p',
        kind: 'constructor',
      },
      {
        depth: 3,
        indent: 2,
        parent: root,
      },
      helpers
    );
  });

  it('should recurse', () => {
    const root = {
      entries: {
        A: { foo: 'a' },
        B: {
          definitions: {
            bb: { kind: 'function' },
          },
        },
      },
    };
    traverse(root, { depth: 0, indent: 0, parent: null }, helpers);
    expect(entry.callCount).to.equal(3);
    expect(entry.getCall(2)).to.have.been.calledWithExactly(
      {
        name: 'bb',
        kind: 'function',
        path: '#/entries/B/definitions/bb',
      },
      {
        depth: 1,
        indent: 0,
        mode: undefined,
        parent: { ...root.entries.B, name: 'B', path: '#/entries/B' },
      },
      helpers
    );
  });

  ['object', 'interface'].forEach((kind) => {
    it(`should switch to list mode when kind is ${kind}`, () => {
      const root = {
        entries: {
          B: {
            kind,
            entries: {
              bb: { kind: 'a' },
            },
          },
        },
      };
      traverse(root, { depth: 0, indent: 0, parent: null }, helpers);
      expect(entry.callCount).to.equal(2);
      expect(entry.getCall(1)).to.have.been.calledWithExactly(
        {
          name: 'bb',
          kind: 'a',
          path: '#/entries/B/entries/bb',
        },
        {
          depth: 1,
          indent: 0,
          mode: 'list',
          parent: { ...root.entries.B, name: 'B', path: '#/entries/B' },
        },
        helpers
      );
    });
  });

  it('should increase indent when in list mode', () => {
    const root = {
      entries: {
        B: {
          kind: 'object',
          entries: {
            bb: { kind: 'object', entries: { cc: {} } },
          },
        },
      },
    };
    traverse(root, { depth: 0, indent: 0, parent: null }, helpers);
    expect(entry.callCount).to.equal(3);
    expect(entry.getCall(2)).to.have.been.calledWithExactly(
      {
        name: 'cc',
        path: '#/entries/B/entries/bb/entries/cc',
      },
      {
        depth: 2,
        indent: 1,
        mode: 'list',
        parent: { ...root.entries.B.entries.bb, name: 'bb', path: '#/entries/B/entries/bb' },
      },
      helpers
    );
  });
});
