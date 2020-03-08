function collectAndNest({ list, asArray }, cfg, opts, entity) {
  const paramMap = {};
  const res = [];
  (list || []).forEach(par => {
    const s = par.name.split('.');
    let parent = paramMap;
    let i = 0;
    for (i = 0; i < s.length - 1; i += 1) {
      const subNameType = s[i];
      const isParentArray = /\[\]$/.test(subNameType);
      const subName = isParentArray ? subNameType.replace(/\[\]$/, '') : subNameType;
      if (!parent[subName]) {
        parent[subName] = {};
      }
      parent = parent[subName];
      if (!parent.kind) {
        parent.kind = isParentArray ? 'array' : 'object';
        delete parent.type;
      }
      if (isParentArray && !parent.items) {
        parent.items = {
          kind: 'object',
          entries: {},
        };
      } else if (isParentArray && !parent.items.entries) {
        parent.items.entries = {};
        if (!parent.items.kind) {
          parent.items.kind = 'object';
          delete parent.items.type;
        }
      } else if (!isParentArray && !parent.entries) {
        // if (!parent.kind) {
        //   parent.kind = 'object';
        //   delete parent.type;
        // }
        parent.entries = {};
      }
      delete parent.type;
      parent = isParentArray ? parent.items.entries : parent.entries;
    }
    const obj = {};
    if (asArray && i === 0 && par.name) {
      obj.name = par.name;
    }
    parent[s[i]] = Object.assign(obj, entity(par, cfg, opts));

    if (i === 0) {
      res.push(parent[s[i]]);
    }
  });
  return asArray ? res : paramMap;
}

module.exports = collectAndNest;
