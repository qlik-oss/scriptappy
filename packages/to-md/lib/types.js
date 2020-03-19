const knownReferences = {
  boolean: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type',
  number: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
  string: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
  undefined: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined',
  class: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes',
};

// TODO - separate nodejs builtins vs web builtins
const builtInType = t => `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${t}`;

function types(spec, customType) {
  const internal = {
    paths: {},
    names: {},
  };

  const typeMap = {};
  const knownRefs = {
    ...knownReferences,
  };

  const assignSlug = (entry, slug) => {
    if (internal.paths[entry.path] && slug) {
      internal.paths[entry.path].slug = slug;
    }
  };

  const getReferences = () => {
    const refs = [];
    Object.keys(typeMap).forEach(key => {
      refs.push({ key, link: knownRefs[key] });
    });

    Object.keys(internal.paths).forEach(key => {
      if (internal.paths[key].slug && internal.paths[key].referenced) {
        refs.push({ key: internal.paths[key].name, link: internal.paths[key].slug });
      }
    });

    return refs;
  };

  const getType = entry => {
    const prefix = `${entry.variable ? '...' : ''}${entry.nullable ? '?' : ''}`;
    if (entry.type && internal.paths[entry.type]) {
      internal.paths[entry.type].referenced = true;
      return `${prefix}[${internal.paths[entry.type].name}]`;
    }

    if (entry.kind === 'literal') {
      return `\`${prefix}${entry.value}\``;
    }

    const t = entry.kind || entry.type;
    const upperT = t[0].toUpperCase() + t.slice(1);
    const text = knownRefs[t] ? t : global[upperT] ? upperT : t; // eslint-disable-line
    if (!typeMap[text]) {
      const custom = customType ? customType(text) : undefined;
      typeMap[text] = text;
      if (custom && custom.url) {
        knownRefs[text] = custom.url;
      }
    }
    if (knownRefs[text]) {
      return `${prefix}[${text}]`;
    }
    if (global[text]) {
      knownRefs[text] = builtInType(text);
      return `${prefix}[${text}]`;
    }
    return `\`${prefix}${text}\``;
  };

  function traverseForTypes(entry) {
    if (entry.kind) {
      let { name } = entry;
      if (internal.names[name]) {
        name += ++internal.names[name]; // eslint-disable-line
      } else {
        internal.names[name] = 1;
      }
      internal.paths[entry.path] = { name };
    }
    ['entries', 'events', 'definitions'].forEach(prop => {
      if (entry[prop]) {
        Object.keys(entry[prop]).forEach(key => {
          const n = {
            ...entry[prop][key],
            name: key,
            path: [entry.path || '#', prop, key].join('/'),
          };
          traverseForTypes(n);
        });
      }
    });
  }

  traverseForTypes(spec);

  return {
    assignSlug,
    getType,
    getReferences,
  };
}

module.exports = types;
