const dom = require('dts-dom');
const params = require('./params');

module.exports = function fn(def, tsParent, g) {
  const par = params(def.params || [], def.this, g);
  const ret = def.returns ? g.getType(def.returns) : dom.type.void;
  if (tsParent && ['class', 'interface', 'object'].includes(tsParent.kind)) {
    return dom.create.method(def.name, par, ret);
  }
  if (tsParent && ['union', 'array', 'parameter'].includes(tsParent.kind)) {
    return dom.create.functionType(par, ret);
  }

  // TODO - async?
  // if (def.optional) {
  //   t.flags = dom.DeclarationFlags.Optional;
  // }
  return dom.create.function(def.name, par, ret);
};
