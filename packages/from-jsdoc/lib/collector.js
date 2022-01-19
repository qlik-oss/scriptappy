const { sortObject } = require('./sort');
const { getParamFromComment, getPropertyFromComment } = require('./type-parser');
const collectAndNest = require('./collect-nest');

/* eslint no-param-reassign: 0 */
function collect({ entity }) {
  function collectParamsFromDoc(doc, cfg, opts) {
    (doc.params || []).forEach((param) => {
      param.exp = getParamFromComment(param.name, doc.comment);
    });
    const par = collectAndNest({ doc, list: doc.params || [], asArray: true }, cfg, opts, entity);
    par.forEach((p) => sortObject(p, cfg));
    return par;
  }

  // collect nested properties
  function collectPropsFromDoc(doc, cfg, opts) {
    (doc.properties || []).forEach((prop) => {
      prop.exp = getPropertyFromComment(prop.name, doc.comment);
    });
    const o = { entries: collectAndNest({ doc, list: doc.properties }, cfg, opts, entity) };
    sortObject(o, cfg);
    return o.entries;
  }

  return {
    collectParamsFromDoc,
    collectPropsFromDoc,
  };
}

module.exports = collect;
