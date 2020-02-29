const dom = require('dts-dom');

module.exports = function a(def, tsParent, g) {
  let subtype = dom.type.any;
  if (def.items && !Array.isArray(def.items)) {
    // same type for all elements
    subtype = g.getType(def.items);
  }
  // TODO - handle tuples when dts-dom supports it
  return dom.create.array(subtype);
};
