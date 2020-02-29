const dom = require('dts-dom');
const params = require('./params');

module.exports = function fn(def, tsParent, g) {
  const f = tsParent && ['class', 'interface', 'object'].indexOf(tsParent.kind) !== -1 ? 'method' : 'function';

  const par = params(def.params || [], def.this, g);
  const ret = def.returns ? g.getType(def.returns) : dom.type.void;

  const t = dom.create[f](def.name, par, ret);

  // TODO - async?
  // if (def.optional) {
  //   t.flags = dom.DeclarationFlags.Optional;
  // }
  return t;
};
