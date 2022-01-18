/* eslint no-bitwise:0 */
const dom = require('dts-dom');

const typeFn = require('./type');
const traverseFn = require('./traverse');
const top = require('./top');

/**
 * @entry
 * @param {object} specification
 * @param {object=} config
 * @param {string=} config.umd
 * @param {('named'|'exports'|'default')=} config.export
 * @param {string=} config.exportConst
 * @param {string=} config.output
 * @param {boolean=} config.showGeneratedComment
 * @returns {string}
 */
function toDts(specification, config) {
  let dts = '';

  const g = {
    specification,
  };
  g.getType = typeFn(g);
  g.traverse = traverseFn(g);

  const { types, entriesRoot, entriesFlags, definitionsRoot } = top(specification, config);

  if (definitionsRoot && definitionsRoot !== entriesRoot) {
    g.namespace = definitionsRoot.name;
  }

  const entries = g.traverse(specification.entries, {
    parent: entriesRoot,
    path: '#/entries',
    flags: entriesFlags,
  });
  const definitions = g.traverse(specification.definitions, {
    parent: definitionsRoot,
    path: '#/definitions',
    flags: 0,
  });

  const toEmit = [...types];

  if (entriesRoot) {
    toEmit.push(entriesRoot);
  }

  toEmit.push(...entries);

  if (definitionsRoot && definitionsRoot !== entriesRoot) {
    toEmit.push(definitionsRoot);
  }
  toEmit.push(...definitions);

  dts += toEmit.map(t => dom.emit(t)).join('');

  return dts;
}

module.exports = toDts;
