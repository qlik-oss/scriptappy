const dom = require('dts-dom');
const params = require('./params');
const typeParams = require('./type-params');

/* eslint no-param-reassign: 0 */

module.exports = function fn(def, tsParent, g) {
  const t = dom.create.interface(def.name);
  if (def.templates) {
    t.typeParameters = typeParams(def.templates, false, g);
  }
  if (def.returns || def.params) {
    const rt = def.returns ? g.getType(def.returns) : dom.type.void;
    const cs = dom.create.callSignature(params(def.params, def.this, g), rt);

    // optional/rest flags for params in call-signatures are NOT printed by dts-dom,
    // so hack it a bit by ammending ... or ? to the name of the param to get the same effect
    // TODO - remove this hack when dts-dom fixes this
    cs.parameters.forEach((p) => {
      if ((p.flags || 0) & dom.ParameterFlags.Optional) {
        p.name += '?';
      } else if (p.flags === dom.ParameterFlags.Rest) {
        p.name = `...${p.name}`;
      }
      p.flags = 0; // reset to avoid flags being used if dts-dom supports it before above code has been removed
    });
    t.members.push(cs);
  }
  if (def.extends) {
    t.baseTypes = t.baseTypes || [];
    def.extends.forEach((d) => {
      t.baseTypes.push(g.getType(d));
    });
  }
  return t;
};
