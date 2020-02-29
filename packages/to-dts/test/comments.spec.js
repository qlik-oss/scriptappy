const com = require('../lib/comments');

describe('comments', () => {
  it('should return undefined when no comments exist', () => {
    expect(com({}, {})).to.equal(undefined);
  });

  it('should return description', () => {
    expect(com({ description: 'desc' }, {})).to.equal('desc');
  });

  it('should return @deprecated', () => {
    expect(com({ availability: { deprecated: {} } }, {})).to.equal('@deprecated');
  });

  it('should return parameters without description', () => {
    expect(com({}, { parameters: [{ name: 'first' }] })).to.equal('@param first');
  });

  it('should return parameters with description', () => {
    expect(com({}, { parameters: [{ name: 'first', description: 'de' }] })).to.equal('@param first de');
  });

  it('should not return with "this" parameter', () => {
    expect(com({}, { parameters: [{ name: 'first' }, { name: 'this' }] })).to.equal('@param first');
  });
});
