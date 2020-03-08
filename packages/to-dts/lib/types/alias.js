const dom = require('dts-dom');

module.exports = function alias(def, tsParent, g) {
  const al = dom.create.alias(def.name, g.getType(def.items, { kind: 'alias' }));
  return al;
};
