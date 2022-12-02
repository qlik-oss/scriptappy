const dom = require('dts-dom');
const ref = require('../lib/types/reference');

jest.mock('dts-dom');

describe('reference', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    dom.create.namedTypeReference.mockImplementation(v => v);
    dom.create.const.mockImplementation((name, type) => `const ${name}: ${type}`);
    dom.create.typeof.mockImplementation(v => `typeof ${v}`);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should return just the first level', () => {
    expect(ref('#/entries/Animal', undefined, {}, false)).to.eql('typeof Animal');
  });

  it('should ignore every other level', () => {
    expect(ref('#/entries/Animal/definitions/Dog', undefined, {}, false)).to.eql('typeof Animal.Dog');
  });

  it('should return without namespace prefix when top path is entries', () => {
    expect(ref('#/entries/Animal', undefined, { namespace: 'farm' }, false)).to.eql('typeof Animal');
  });

  it('should return with namespace prefix when top path is definitions', () => {
    expect(ref('#/definitions/Animal', undefined, { namespace: 'farm' }, false)).to.eql('farm.Animal');
  });

  it('should return `const name: type` for API entries', () => {
    expect(ref('#/definitions/Embed', 'embed', { namespace: 'Stardust' }, true)).to.eql('const embed: Stardust.Embed');
  });
});
