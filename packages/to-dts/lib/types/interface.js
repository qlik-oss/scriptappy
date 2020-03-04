const dom = require('dts-dom');
const params = require('./params');
const typeParams = require('./type-params');

module.exports = function fn(def, tsParent, g) {
  let tt = '';
  if (def.templates) {
    // dts-dom has no support for typeParameters on interface yet,
    // so we create a class and extract the typeParameters from it
    const cc = dom.create.class('XXX');
    cc.typeParameters = typeParams(def.templates, false, g);
    const mt = dom.emit(cc).match(/class XXX(.*) {\r/);
    if (mt && mt[1]) {
      [, tt] = mt;
    }
  }
  const t = dom.create.interface(`${def.name}${tt}`);
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
