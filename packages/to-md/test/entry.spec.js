const entryFn = require('../lib/entry');

describe('entry', () => {
  let entry;
  let templates;
  let helpers;
  beforeEach(() => {
    helpers = {
      addToToc: sinon.spy(),
      assignSlug: sinon.stub(),
    };

    templates = {
      default: {
        slugify: sinon.stub().returns('slug'),
        toc: sinon.stub().returns('toc'),
        listItem: sinon.stub().returns('li'),
        label: sinon.stub().returns('label'),
        description: sinon.stub().returns('descr'),
        meta: sinon.stub().returns('meta'),
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
        meta: sinon.stub().returns('foo - meta'),
        description: sinon.stub().returns('foo - descr'),
        paramSignature: sinon.stub().returns('foo - signature'),
        paramDetails: sinon.stub().returns('foo - details'),
        header: sinon.stub().returns('foo - header'),
        examples: sinon.stub().returns('foo - examples'),
      },
      ev: {
        label() {
          return 'event: e';
        },
        paramSignature: sinon.stub().returns(null),
      },
    };
    entry = entryFn(templates);
  });

  it('should return list item when mode="list"', () => {
    const n = { kind: 'k' };
    const cfg = {
      mode: 'list',
    };
    const e = entry(n, cfg, helpers);
    expect(e).to.equal('li\n');
    expect(templates.default.listItem.getCall(0)).to.have.been.calledWithExactly(n, cfg, helpers);
  });

  it('should call template methods with entry, cfg and helpers params', () => {
    const n = { params: [] };
    const cfg = {};
    entry(n, cfg, helpers);
    ['label', 'description', 'paramSignature', 'paramDetails'].forEach(fn => {
      expect(templates.default[fn].getCall(0)).to.have.been.calledWithExactly(n, cfg, helpers);
    });
  });

  it('should add to TOC', () => {
    const n = { kind: 'function' };
    const cfg = {};
    entry(n, cfg, helpers);
    expect(templates.default.toc.getCall(0)).to.have.been.calledWithExactly('label', cfg);
    expect(helpers.addToToc.getCall(0)).to.have.been.calledWithExactly('toc');
  });

  it('should return a simple section', () => {
    const n = {};
    const cfg = {};
    const e = entry(n, cfg, helpers);
    expect(e).to.equal(`

header

meta

descr

examples

`);
  });
  it('should return a function section when params is defined', () => {
    const n = { params: [] };
    const cfg = {};
    const e = entry(n, cfg, helpers);
    expect(templates.default.header.getCall(0)).to.have.been.calledWithExactly('label(signature)', cfg);
    expect(e).to.equal(`

header

meta

details

descr

examples

`);
  });

  it('should not use signature when it returns null', () => {
    const n = { kind: 'ev', params: [] };
    const cfg = {};
    entry(n, cfg, helpers);
    expect(templates.ev.paramSignature.getCall(0)).to.have.been.calledWithExactly(n, cfg, helpers);
    expect(templates.default.header.getCall(0)).to.have.been.calledWithExactly('event: e', cfg);
  });

  it('should call "method" label template when kind is function and parent is a class', () => {
    const n = { kind: 'function' };
    const cfg = { parent: { kind: 'class' } };
    entry(n, cfg, helpers);
    expect(templates.method.label.callCount).to.equal(1);
  });

  it('should use custom templates when they exist', () => {
    const n = { kind: 'foo', params: [] };
    const cfg = {};
    const e = entry(n, cfg, helpers);
    expect(e).to.equal(`

foo - header

foo - meta

foo - details

foo - descr

foo - examples

`);
  });
});
