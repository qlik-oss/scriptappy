const top = require('../lib/top');

describe('top', () => {
  it('should return umd template when umd option is a string', () => {
    expect(
      top(
        {},
        {
          umd: 'unified',
        }
      ).types
    ).to.eql(['export as namespace unified']);
  });

  it('should return named template by default', () => {
    expect(top({}, {})).to.eql({
      types: [],
      entriesRoot: undefined,
      entriesFlags: 16,
      definitionsRoot: undefined,
    });
  });

  it('should return exports template when only one entry', () => {
    expect(top({ entries: { a: {} } })).to.eql({
      types: [
        {
          kind: 'export=',
          target: 'a',
        },
      ],
      entriesRoot: undefined,
      entriesFlags: 0,
      definitionsRoot: undefined,
    });
  });

  it('should return export default template when explicitly set', () => {
    expect(top({ entries: { a: {} } }, { export: 'default' })).to.eql({
      types: [
        {
          kind: 'exportDefault',
          name: 'a',
        },
      ],
      entriesRoot: undefined,
      entriesFlags: 0,
      definitionsRoot: undefined,
    });
  });

  it('should return definitions template when definitions exist', () => {
    expect(top({ info: { name: '@foo/my-lib.js' }, definitions: { d: {} } })).to.eql({
      types: [],
      entriesRoot: undefined,
      entriesFlags: 16,
      definitionsRoot: {
        kind: 'namespace',
        members: [],
        name: 'myLib',
      },
    });
  });

  it('should include comment that output is generated', () => {
    expect(top({}, { includeDisclaimer: true })).to.eql({
      types: ['// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.'],
      entriesRoot: undefined,
      entriesFlags: 16,
      definitionsRoot: undefined,
    });
  });

  it('should return triple slash reference when dependency ref exists', () => {
    expect(top({}, { dependencies: { references: ['qlik-engineapi'] } })).to.eql({
      types: ['/// <reference types="qlik-engineapi" />'],
      entriesRoot: undefined,
      entriesFlags: 16,
      definitionsRoot: undefined,
    });
  });
});
