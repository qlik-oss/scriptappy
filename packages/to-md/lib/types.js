const knownReferences = {
  Array: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  boolean: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type',
  number: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
  string: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
  function: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
  Object: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  Promise: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
  class: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes',
};

function types(spec) {
  const internal = {
    paths: {},
    names: {},
  };

  const typeMap = {};

  const assignSlug = (entry, slug) => {
    if (internal.paths[entry.path] && slug) {
      internal.paths[entry.path].slug = slug;
    }
  };

  const getReferences = () => {
    const refs = [];
    Object.keys(typeMap).forEach((key) => {
      refs.push({ key, link: knownReferences[key] });
    });

    Object.keys(internal.paths).forEach((key) => {
      if (internal.paths[key].slug && internal.paths[key].referenced) {
        refs.push({ key: internal.paths[key].name, link: internal.paths[key].slug });
      }
    });

    return refs;
  };

  const getType = (entry) => {
    const prefix = entry.variable ? '...' : '';
    if (entry.type && internal.paths[entry.type]) {
      internal.paths[entry.type].referenced = true;
      return `${prefix}[${internal.paths[entry.type].name}]`;
    }

    if (entry.kind === 'literal') {
      return `\`${prefix}${entry.value}\``;
    }

    const t = entry.kind || entry.type;
    const alias = t[0].toUpperCase() + t.slice(1);
    const text = knownReferences[alias] ? alias : t;
    if (!typeMap[text]) {
      typeMap[text] = text;
    }
    if (knownReferences[text]) {
      return `${prefix}[${text}]`;
    }
    return `\`${prefix}${text}\``;
  };

  function traverseForTypes(entry) {
    if (entry.kind) {
      let { name } = entry;
      if (internal.names[name]) {
        name += ++internal.names[name] // eslint-disable-line
      } else {
        internal.names[name] = 1;
      }
      internal.paths[entry.path] = { name };
    }
    ['entries', 'events', 'definitions'].forEach((prop) => {
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
