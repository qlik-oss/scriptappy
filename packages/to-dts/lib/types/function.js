/* eslint-disable no-param-reassign */
const dom = require('dts-dom');
const params = require('./params');

module.exports = function fn(def, tsParent, g) {
  const par = params(def.params || [], def.this, g);
  const ret = def.returns ? g.getType(def.returns) : dom.type.void;
  if (tsParent && ['class', 'interface', 'object'].includes(tsParent.kind)) {
    return dom.create.method(def.name, par, ret);
  }
  if (tsParent && ['union', 'array', 'parameter', 'alias'].includes(tsParent.kind)) {
    return dom.create.functionType(par, ret);
  }
  if (def.entries) {
    const t = dom.create.objectType([]);
    const cs = dom.create.callSignature(par, ret);

    // optional/rest flags for params in call-signatures are NOT printed by dts-dom,
    // so hack it a bit by ammending ... or ? to the name of the param to get the same effect
    // TODO - remove this hack when dts-dom fixes this
    cs.parameters.forEach(p => {
      if ((p.flags || 0) & dom.ParameterFlags.Optional) {
        p.name += '?';
      } else if (p.flags === dom.ParameterFlags.Rest) {
        p.name = `...${p.name}`;
      }
      p.flags = 0; // reset to avoid flags being used if dts-dom supports it before above code has been removed
    });
    t.members.push(cs);
    return t;
  }

  // TODO - async?
  // if (def.optional) {
  //   t.flags = dom.DeclarationFlags.Optional;
  // }
  const fnType = dom.create.functionType(par, ret);
  return dom.create.alias(def.name, fnType);
};
