const { getParamFromComment, getPropertyFromComment, parse } = require('../lib/type-parser');

describe('type-parser', () => {
  describe('comment', () => {
    it('param', () => {
      const c = '/**\n * @param {function():T} par.foo descr\n * @param {{blapar.foopar.o}} par.oo\n */';

      expect(getParamFromComment('par.oo', c)).to.equal('{blapar.foopar.o}');
    });
    it('property', () => {
      const c = '/**\n * @property {function():T} pro.foo descr\n * @property {{blapar.foopar.o}} pro.oo\n */';

      expect(getPropertyFromComment('pro.oo', c)).to.equal('{blapar.foopar.o}');
    });
  });

  describe('parse', () => {
    it('function as reference', () => {
      const c = parse('function');
      expect(c).to.eql({
        type: 'function',
      });
    });

    it('function', () => {
      const c = parse('function(boolean, ...number): string');
      expect(c).to.eql({
        kind: 'function',
        params: [{ type: 'boolean' }, { type: 'number', variable: true }],
        returns: { type: 'string' },
      });
    });

    it('union', () => {
      const c = parse('(number|(boolean|string))');
      expect(c).to.eql({
        kind: 'union',
        items: [{ type: 'number' }, { kind: 'union', items: [{ type: 'boolean' }, { type: 'string' }] }],
      });
    });

    it('array', () => {
      const c = parse('Array<Array<string[]>>');
      expect(c).to.eql({
        kind: 'array',
        items: { kind: 'array', items: { kind: 'array', items: { type: 'string' } } },
      });
    });

    it('tuple', () => {
      const c = parse('Array<string, number>');
      expect(c).to.eql({
        kind: 'array',
        items: [{ type: 'string' }, { type: 'number' }],
      });
    });

    it('object signature', () => {
      const c = parse('Object<string, number>');
      expect(c).to.eql({
        kind: 'object',
        entries: {},
        generics: [{ type: 'string' }, { type: 'number' }],
      });
    });

    it('object', () => {
      const c = parse('{ a: { aa: number }, b: Animal, c}');
      expect(c).to.eql({
        kind: 'object',
        entries: {
          a: { kind: 'object', entries: { aa: { type: 'number' } } },
          b: { type: 'Animal' },
          c: { type: 'any' },
        },
      });
    });

    it('generic signature', () => {
      const c = parse('Animal<Dog|Cat>');
      expect(c).to.eql({
        type: 'Animal',
        generics: [{ kind: 'union', items: [{ type: 'Dog' }, { type: 'Cat' }] }],
      });
    });

    it('undefined', () => {
      const c = parse('undefined');
      expect(c).to.eql({
        type: 'undefined',
      });
    });

    it('literal string', () => {
      const c = parse('"foo"');
      expect(c).to.eql({
        kind: 'literal',
        value: '"foo"',
      });
    });

    it('literal number', () => {
      const c = parse('3');
      expect(c).to.eql({
        kind: 'literal',
        value: 3,
      });
    });

    it('literal boolean', () => {
      expect(parse('false')).to.eql({
        kind: 'literal',
        value: 'false',
      });
      expect(parse('true')).to.eql({
        kind: 'literal',
        value: 'true',
      });
    });

    it('modifiers', () => {
      const c = parse('{ a=, !b: string, ?c}');
      expect(c).to.eql({
        kind: 'object',
        entries: {
          a: { type: 'any', optional: true },
          b: { type: 'string', nullable: false },
          c: { type: 'any', nullable: true },
        },
      });
    });
  });
});
