const { sortObject } = require('./sort');
const collectAndNest = require('./collect-nest');

function collect({ entity }) {
  function collectParamsFromDoc(doc, cfg, opts) {
    const par = collectAndNest({ doc, list: doc.params || [], asArray: true }, cfg, opts, entity);
    par.forEach(p => sortObject(p));
    return par;
  }

  // collect nested properties
  function collectPropsFromDoc(doc, cfg, opts) {
    const o = { entries: collectAndNest({ doc, list: doc.properties }, cfg, opts, entity) };
    sortObject(o);
    return o.entries;
  }

  return {
    collectParamsFromDoc,
    collectPropsFromDoc,
  };
}

module.exports = collect;
