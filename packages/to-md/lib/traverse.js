function trav(n, entry, cfg, helpers) {
  let s = helpers.entry(
    n,
    {
      ...cfg,
      parent: entry,
    },
    helpers
  );
  const isList = cfg.mode === 'list' || ['object', 'interface'].indexOf(n.kind) !== -1;
  s += traverse(
    n,
    {
      ...cfg,
      mode: isList ? 'list' : cfg.mode,
      depth: cfg.depth + 1,
      indent: cfg.indent + (cfg.mode === 'list' ? 1 : 0),
    },
    helpers
  );

  return s;
}

function traverse(
  entry,
  cfg = {
    depth: 0,
    indent: 0,
    parent: null,
  },
  helpers
) {
  let ss = '';
  if (Object.prototype.hasOwnProperty.call(entry, 'constructor')) {
    // eslint-disable-line
    const n = {
      ...entry.constructor,
      ...{ kind: 'constructor' },
      name: entry.name,
    };
    ss += trav(n, entry, cfg, helpers);
  }
  ['staticEntries', 'entries', 'events', 'definitions'].forEach((prop) => {
    if (entry[prop]) {
      Object.keys(entry[prop]).forEach((key) => {
        const n = {
          ...entry[prop][key],
          name: key,
          path: [entry.path || '#', prop, key].join('/'),
        };
        ss += trav(n, entry, cfg, helpers);
      });
    }
  });
  return ss;
}

module.exports = traverse;
