describe('config', () => {
  const defaultConfig = {
    spec: 'scriptappy.json',
    umd: undefined,
    export: undefined,
    output: {
      file: 'index.d.ts',
    },
    includeDisclaimer: true,
  };

  let getConfig;
  before(() => {
    [{ getConfig }] = aw.mock([['**/*/spec.config.js', () => defaultConfig]], ['../lib/config']);
  });

  it('returns default config', () => {
    const config = getConfig({});
    expect(config).to.eql({
      spec: 'scriptappy.json',
      output: { file: 'index.d.ts' },
      includeDisclaimer: true,
    });
  });

  it('returns config provided to cli', () => {
    expect(getConfig({ spec: 'spec.json', includeDisclaimer: false })).to.eql({
      spec: 'spec.json',
      output: { file: 'index.d.ts' },
      includeDisclaimer: false,
    });
  });
});
