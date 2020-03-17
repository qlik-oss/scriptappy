const dom = require('dts-dom');

module.exports = function enm(def) {
  const e = dom.create.enum(def.name, true);
  return e;
};
