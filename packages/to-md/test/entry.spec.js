const mock = ({
  log = () => ({}),
} = {}) => aw.mock([
  ['**/log.js', () => log],
], ['../lib/entry']);

describe('entry', () => {
  let entry;
  let log;
  let helpers;
  beforeEach(() => {
    helpers = {
      addToToc: sinon.spy(),
      assignSlug: sinon.stub(),
    };

    log = {
      templates: {
        default: {
          slugify: sinon.stub().returns('slug'),
          toc: sinon.stub().returns('toc'),
          listItem: sinon.stub().returns('li'),
          label: sinon.stub().returns('label'),
          description: sinon.stub().returns('descr'),
          paramSignature: sinon.stub().returns('signature'),
          paramDetails: sinon.stub().returns('details'),
          header: sinon.stub().returns('header'),
          examples: sinon.stub().returns('examples'),
        },
        method: {
          label: sinon.stub().returns('method'),
        },
        foo: {
          listItem: sinon.stub().returns('foo - li'),
          label: sinon.stub().returns('foo - label'),
          description: sinon.stub().returns('foo - descr'),
          paramSignature: sinon.stub().returns('foo - signature'),
          paramDetails: sinon.stub().returns('foo - details'),
          header: sinon.stub().returns('foo - header'),
          examples: sinon.stub().returns('foo - examples'),
        },
      },
    };
    [entry] = mock({ log });
  });

  it('should return list item when mode="list"', () => {
    const n = { kind: 'k' };
    const cfg = {
      mode: 'list',
    };
    const e = entry(n, cfg, helpers);
    expect(e).to.equal('li\n');
    expect(log.templates.default.listItem.getCall(0)).to.have.been.calledWithExactly(n, cfg, helpers);
  });

  it('should call template methods with entry, cfg and helpers params', () => {
    const n = { params: [] };
    const cfg = {};
    entry(n, cfg, helpers);
    ['label', 'description', 'paramSignature', 'paramDetails'].forEach(fn => {
      expect(log.templates.default[fn].getCall(0)).to.have.been.calledWithExactly(n, cfg, helpers);
    });
  });

  it('should add to TOC', () => {
    const n = { kind: 'function' };
    const cfg = {};
    entry(n, cfg, helpers);
    expect(log.templates.default.toc.getCall(0)).to.have.been.calledWithExactly('label', cfg);
    expect(helpers.addToToc.getCall(0)).to.have.been.calledWithExactly('toc');
  });

  it('should return a simple section', () => {
    const n = {};
    const cfg = {};
    const e = entry(n, cfg, helpers);
    expect(e).to.equal(`

header

descr

examples

`);
  });
  it('should return a function section when params is defined', () => {
    const n = { params: [] };
    const cfg = {};
    const e = entry(n, cfg, helpers);
    expect(log.templates.default.header.getCall(0)).to.have.been.calledWithExactly('label(signature)', cfg);
    expect(e).to.equal(`

header

details

descr

examples

`);
  });

  it('should call "method" label template when kind is function and parent is a class', () => {
    const n = { kind: 'function' };
    const cfg = { parent: { kind: 'class' } };
    entry(n, cfg, helpers);
    expect(log.templates.method.label.callCount).to.equal(1);
  });

  it('should use custom templates when they exist', () => {
    const n = { kind: 'foo', params: [] };
    const cfg = {};
    const e = entry(n, cfg, helpers);
    expect(e).to.equal(`

foo - header

foo - details

foo - descr

foo - examples

`);
  });
});
