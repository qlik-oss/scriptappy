const dom = require('dts-dom');
const params = require('./params');

module.exports = function fn(def, tsParent, g) {
  const t = dom.create.interface(def.name);
  if (def.returns || def.params) {
    const rt = def.returns ? g.getType(def.returns) : dom.type.void;
    const cs = dom.create.callSignature(params(def.params, def.this, g), rt);
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
