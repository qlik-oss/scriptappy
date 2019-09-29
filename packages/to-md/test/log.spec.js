const { templates } = require('../lib/log');

describe('log', () => {
  const d = templates.default;

  describe('defaults', () => {
    it('pre', () => {
      expect(d.pre).to.equal('###');
    });

    it('slugify', () => {
      expect(d.slugify('aB-c (d_e1)	  f')).to.equal('#ab-c-de1-f'); // eslint-disable-line no-tabs
    });

    describe('type', () => {
      const helpers = { getType: () => 't' };
      it('simple', () => {
        expect(d.type({ kind: 'union' }, null, helpers)).to.equal('<t>');
      });

      it('union', () => {
        expect(d.type({ kind: 'union', items: [{}, {}] }, null, helpers)).to.equal('<t|t>');
      });

      it('array', () => {
        expect(d.type({ kind: 'array', items: {} }, null, helpers)).to.equal('<t<t>>');
      });

      it('generics', () => {
        expect(d.type({ kind: '', generics: [{}, {}] }, null, helpers)).to.equal('<t<t,t>>');
      });
    });

    it('listItem', () => {
      const typeStub = sinon.stub(d, 'type');
      typeStub.callsFake(() => 't');
      try { // run inside try catch to make sure restore() happens when expect fails
        expect(d.listItem({ name: 'item', description: 'd' }, { indent: 3 })).to.equal('      - `item` t d');
      } catch (e) {
        throw e;
      } finally {
        typeStub.restore();
      }
    });

    it('listItem with defaultValue', () => {
      const typeStub = sinon.stub(d, 'type');
      typeStub.callsFake(() => 't');
      try { // run inside try catch to make sure restore() happens when expect fails
        expect(d.listItem({ name: 'item', description: 'd', defaultValue: 'def' }, { indent: 3 })).to.equal('      - `item` t d. Defaults to `def`');
      } catch (e) {
        throw e;
      } finally {
        typeStub.restore();
      }
    });

    it('listItem with default described in description', () => {
      const typeStub = sinon.stub(d, 'type');
      typeStub.callsFake(() => 't');
      try { // run inside try catch to make sure restore() happens when expect fails
        expect(d.listItem({
          name: 'item',
          description: 'bla bla defaults to bla bla',
          defaultValue: 'def',
        }, { indent: 3 })).to.equal('      - `item` t bla bla defaults to bla bla');
      } catch (e) {
        throw e;
      } finally {
        typeStub.restore();
      }
    });

    it('label', () => {
      expect(d.label({ kind: 'k', name: 'n' })).to.equal('k: n');
    });

    it('toc', () => {
      expect(d.toc('label', { depth: 1 })).to.equal('  - [label](#label)');
    });

    it('header', () => {
      expect(d.header('head', { depth: 2 })).to.equal('##### head');
    });

    it('description', () => {
      expect(d.description({ description: 'descr' })).to.equal('descr');
    });

    it('paramSignature', () => {
      expect(d.paramSignature({
        params: [
          { name: 'first' },
          { name: 'second' },
        ],
      })).to.equal('first, second');
    });

    it('paramSignature multiple optional', () => {
      expect(d.paramSignature({
        params: [
          { name: 'first' },
          { name: 'second', optional: true },
          { name: 'third', optional: true },
        ],
      })).to.equal('first[, second[, third]]');
    });

    it('paramSignature with first param optional', () => {
      expect(d.paramSignature({
        params: [
          { name: 'first', optional: true },
        ],
      })).to.equal('[first]');
    });

    it('paramSignature with bad optional order', () => {
      expect(d.paramSignature({
        params: [
          { name: 'first' },
          { name: 'second', optional: true },
          { name: 'third' },
        ],
      })).to.equal('first[, second], third');
    });

    it('paramDetails', () => {
      const cfg = {
        indent: 1,
      };
      const helpers = {
        entry: sinon.stub().returns('p'),
        traverse: sinon.stub().returns('t'),
      };
      const params = [{ name: 'first' }, { name: 'second' }];
      expect(d.paramDetails({ params, returns: { type: 'string' } }, cfg, helpers)).to.equal('ptptpt');

      expect(helpers.entry.getCall(0)).to.have.been.calledWithExactly({ name: 'first' }, { ...cfg, mode: 'list' }, helpers);
      expect(helpers.traverse.getCall(0)).to.have.been.calledWithExactly({ name: 'first' }, { ...cfg, mode: 'list', indent: 2 }, helpers);

      expect(helpers.entry.getCall(2)).to.have.been.calledWithExactly({ name: 'returns:', type: 'string' }, { ...cfg, mode: 'list' }, helpers);
      expect(helpers.traverse.getCall(2)).to.have.been.calledWithExactly({ name: 'returns:', type: 'string' }, { ...cfg, mode: 'list', indent: 2 }, helpers);
    });
  });

  describe('method', () => {
    const m = templates.method;
    it('label', () => {
      expect(m.label({ name: 'open' }, { parent: { name: 'Session' } })).to.equal('session.open');
    });

    it('static label', () => {
      expect(m.label({ name: 'open', path: 'foo/staticEntries/open' }, { parent: { name: 'Session' } })).to.equal('Session.open');
    });
  });

  describe('constructor', () => {
    const c = templates.constructor;
    it('label', () => {
      expect(c.label({ name: 'Session' })).to.equal('new Session');
    });
  });
});
