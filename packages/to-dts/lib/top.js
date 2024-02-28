const dom = require('dts-dom');

module.exports = function top(spec, { umd = '', export: exp, includeDisclaimer, dependencies = {} } = {}) {
  // dom.create.namespace('supernova');
  const types = [];
  let entriesFlags = 0;
  // let definitionsFlags = 0;
  let entriesRoot;
  let libraryName;
  let ex = exp || 'named';

  if (includeDisclaimer) {
    types.push('// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.');
  }

  if (Array.isArray(dependencies.references)) {
    dependencies.references.forEach((reference) => {
      types.push(`/// <reference types="${reference}" />`);
    });
  }

  if (Array.isArray(dependencies.imports)) {
    dependencies.imports.forEach((imp) => {
      types.push(`import ${imp.type} from ${imp.package};`);
    });
  }

  const entries = Object.keys(spec.entries || {});
  const definitions = Object.keys(spec.definitions || {});
  if (entries.length === 1) {
    [libraryName] = entries;
    ex = exp || 'exports';
  }

  if (umd) {
    types.push(`export as namespace ${umd}`);

    if (!libraryName) {
      libraryName = umd;
    }
  }
  if (!libraryName && spec.info) {
    const n = spec.info.name
      .split('/')
      .reverse()[0]
      .split('.')[0]
      .replace(/-([A-z0-9])/g, (v) => `${v[1].toUpperCase()}`);
    libraryName = n;
  }

  const definitionsRoot = definitions.length ? dom.create.namespace(libraryName) : undefined;

  // "export = x" is used for commonjs modules of type "module.exports = x"
  // "export default x" is used for es6 modules of type "export default x"
  // "export x" is for named exports
  if (ex === 'default') {
    types.push(dom.create.exportDefault(libraryName));
  } else if (ex === 'exports') {
    types.push(dom.create.exportEquals(libraryName));
  } else {
    // named
    entriesFlags = dom.DeclarationFlags.Export;
  }

  return {
    types,
    entriesRoot,
    entriesFlags,
    definitionsRoot,
  };
};
