const dom = require('dts-dom');
const params = require('./params');
const typeParams = require('./type-params');

module.exports = function fn(def, tsParent, g) {
  const t = dom.create.interface(def.name);
  if (def.returns || def.params) {
    const rt = def.returns ? g.getType(def.returns) : dom.type.void;
    const cs = dom.create.callSignature(params(def.params, def.this, g), rt);
    // dts-dom has no support for typeParameters on interface, so we need to
    // add the type parameters to the call-signature
    if (def.templates && !t.typeParameters) {
      cs.typeParameters = typeParams(def.templates, false, g);
    }
    t.members.push(cs);
  }
  if (def.extends) {
    t.baseTypes = t.baseTypes || [];
    def.extends.forEach(d => {
      t.baseTypes.push(g.getType(d));
    });
  }
  return t;
};
