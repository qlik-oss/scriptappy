const dom = require('dts-dom');
const params = require('./params');

module.exports = function klass(def, tsParent, g) {
  const t = dom.create.class(def.name);
  if (Object.prototype.hasOwnProperty.call(def, 'constructor')) {
    const c = dom.create.constructor(params(def.constructor.params || [], false, g));
    t.members.push(c);
  }

  if (def.extends && def.extends[0]) {
    t.baseType = g.getType(def.extends[0]);
  }
  (def.implements || []).forEach(i => {
    t.implements.push(g.getType(i));
  });
  // traverse(def.staticEntries || {}, t, `${path}/staticEntries`, {
  //   flags: dom.DeclarationFlags.Static,
  // });
  return t;
};
