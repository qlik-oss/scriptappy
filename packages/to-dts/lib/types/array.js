const dom = require('dts-dom');

const extract = s => {
  return s.match(/=\s(.*);/)[1];
};

module.exports = function a(def, tsParent, g) {
  let subtype = dom.type.any;
  if (def.items && !Array.isArray(def.items)) {
    // same type for all elements
    subtype = g.getType(def.items);
  } else if (Array.isArray(def.items)) {
    // hackish way of handling tuples
    // TODO - handle tuples properly when dts-dom supports it
    subtype = def.items.map(t => extract(dom.emit(dom.create.alias('a', g.getType(t)))));
    return `[${subtype.join(', ')}]`;
  }
  return dom.create.array(subtype);
};
