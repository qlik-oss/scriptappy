const dom = require('dts-dom');

module.exports = function union(def, tsParent, g) {
  const un = dom.create.union(def.items.map($ => g.getType($, { kind: 'union' })));
  return un;
  // return !tsParent || tsParent.kind === 'namespace' ? dom.create.alias(def.name, un) : un;
};
