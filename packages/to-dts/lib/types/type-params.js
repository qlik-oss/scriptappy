const dom = require('dts-dom');

module.exports = function typeParams(templates, tsParent, g) {
  const ty = templates.map(tt => {
    const basetype = tt.type ? g.getType(tt) : undefined;
    const defaultType = typeof tt.defaultValue !== 'undefined' ? g.getType({ type: tt.defaultValue }) : undefined;
    const tp = dom.create.typeParameter(tt.name, basetype);
    if (defaultType) {
      tp.defaultType = defaultType;
    }
    return tp;
  });

  return ty;
};
