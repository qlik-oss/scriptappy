/* eslint no-use-before-define: 0 */

// TODO
// get/set
// implements, extends?
// symbols
// errors
// meta - examples, see, links, inline tags
// resolve type schema reference

const EXCLUDE_TAGS = ['definition'];

function tags(doc) {
  const o = {};

  (doc.tags || []).forEach(tag => {
    if (EXCLUDE_TAGS.indexOf(tag.title) !== -1) {
      // do nothing
    } else if (tag.title === 'stability') {
      o.stability = +tag.value;
    } else {
      o[`x-${tag.title}`] = tag.value;
    }
  });

  return o;
}

const SINCE_RX = /^(?:Deprecated\s)?since\s(\d+\.\d+.\d+)/;

function availability(doc) {
  const o = {};
  if (doc.deprecated || doc.since) {
    o.availability = {};
    if (doc.since) {
      o.availability.since = doc.since;
    }
    if (doc.deprecated) {
      if (typeof doc.deprecated === 'string' && SINCE_RX.test(doc.deprecated)) {
        o.availability.deprecated = {
          description: doc.deprecated,
          since: SINCE_RX.exec(doc.deprecated)[1],
        };
      } else {
        o.availability.deprecated = true;
      }
    }
  }

  return o;
}


function collectAndNest(params, isParams = false) {
  const paramMap = {};
  const res = [];
  (params || []).forEach(par => {
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
        parent.kind = isParentArray ? 'array' : 'struct';
      }
      if (isParentArray && !parent.items) {
        parent.items = {
          kind: 'struct',
          entries: {},
        };
      } else if (isParentArray && !parent.items.entries) {
        parent.items.entries = {};
        if (!parent.items.kind) {
          parent.items.kind = 'struct';
          delete parent.items.type;
        }
      } else if (!isParentArray && !parent.entries) {
        if (!parent.kind) {
          parent.kind = 'struct';
          delete parent.type;
        }
        parent.entries = {};
      }
      // const parentDef = isParentArray ? parent.typedef.items : parent.typedef;
      // if (parentDef.kind !== 'object') {
      //   parentDef.kind = 'object';
      // }
      parent = isParentArray ? parent.items.entries : parent.entries;
    }
    // parent[s[i]] = param(par, i ? {skipName: true, includeId: false } : undefined);
    parent[s[i]] = entity(par, { includeName: isParams && i === 0 });
    if (i === 0) {
      res.push(parent[s[i]]);
    }
  });

  return isParams ? res : paramMap;
}

function collectParams(params) {
  return collectAndNest(params, true);
}

// collect nested properties
function collectProps(props) {
  return collectAndNest(props);
}

function getTypeFromCodeMeta(doc) {
  const o = {};
  if (!doc.meta || !doc.meta.code) {
    console.warn('--UNKNOWN--', doc.longname);
    return o;
  }
  if (doc.meta.code.type === 'ObjectExpression') {
    o.kind = 'object';
  } else if (doc.meta.code.type === 'Literal') {
    o.kind = 'literal';
    o.value = doc.meta.code.value;
  }

  return o;
}

function simpleType(type) {
  const t = {
    type: type.replace(/\.</g, '<'),
  };

  return t;
}

function unwrapArrayGeneric(type) {
  const typedef = {};
  let itemtype = type.match(/<(.+)>/);
  if (itemtype) {
    [, itemtype] = itemtype;
  } else {
    itemtype = 'any';
  }
  const isTuple = /,/.test(itemtype);
  typedef.kind = 'array';
  if (isTuple) {
    typedef.items = itemtype.split(',').map(t => getTypedef({ type: { names: [t] } }));
  } else {
    typedef.items = getTypedef({
      type: { names: [itemtype] },
    });
  }

  return typedef;
}

function getTypedef(doc) {
  let type;
  const typedef = {};
  if (doc.kind === 'module') {
    return kindModule(doc);
  } else if (doc.kind === 'namespace') {
    return kindNamespace(doc);
  } else if (doc.kind === 'function') {
    return kindFunction(doc);
  } else if (doc.kind === 'event') {
    const t = kindFunction(doc);
    t.kind = 'event';
    return t;
  } else if (doc.kind === 'class') {
    return kindClass(doc);
  } else if (doc.kind === 'interface') {
    return kindInterface(doc);
  } else if (!doc.type || !doc.type.names) {
    const t = getTypeFromCodeMeta(doc);
    if (!t.kind) {
      console.warn('WARN: unknown type', doc.kind, doc.longname || doc.name);
      type = 'any';
    } else {
      type = t.kind;
      if (type === 'literal' && 'value' in t) {
        typedef.value = t.value;
        typedef.kind = t.kind;
        return typedef;
      }
    }
  } else if (doc.type.names.length === 1) {
    [type] = doc.type.names;
    if (type === 'function') {
      return doc.kind === 'typedef' ? kindFunction(doc) : {
        type: 'function',
      };
    }
  } else {
    typedef.kind = 'union';
    typedef.union = doc.type.names.map(simpleType);
  }

  if (type === 'object') {
    const entries = collectProps(doc.properties);
    if (doc.kind || Object.keys(entries).length) {
      typedef.kind = doc.kind === 'typedef' ? 'struct' : 'object';
      typedef.entries = entries;
    }
  }

  if (/Array\.</.test(type) || type === 'array') {
    return unwrapArrayGeneric(type);
  } else if (/\.</.test(type)) { // generic
    typedef.type = type.replace(/\.</g, '<');
  } else if (type && type !== (typedef.kind || !typedef.kind)) {
    typedef.type = type;
  }

  return typedef;
}

function kindFunction(doc) {
  const f = {
    kind: 'function',
    params: [],
  };

  f.params.push(...collectParams(doc.params || []));

  if (doc.returns) {
    if (doc.returns.length > 1) {
      console.warn('Multiple returns from ', doc.longname);
    }
    f.returns = entity(doc.returns[0]);
  }

  if (doc.async) {
    f.async = true;
  }

  if (doc.generator || doc.yields) {
    f.generator = true;
    if (doc.yields && doc.yields.length > 1) {
      f.yields = {
        kind: 'union',
        union: doc.yields.map(y => entity(y)),
      };
    } else if (doc.yields) {
      f.yields = entity(doc.yields[0]);
    }
  }

  if (doc.fires && doc.fires.length) {
    f.emits = doc.fires.map(simpleType);
  }

  return f;
}

function kindModule() {
  return {
    kind: 'module',
    entries: {},
  };
}

function kindNamespace() {
  return {
    kind: 'namespace',
    entries: {},
  };
}

function kindClass(doc) {
  return {
    kind: 'class',
    constructor: {
      description: doc.description,
      typedef: kindFunction(doc),
    },
    entries: {},
  };
}

function kindInterface(doc) {
  const fn = kindFunction(doc);
  const obj = {
    kind: 'interface',
  };
  Object.keys(fn).filter(key => key !== 'kind').forEach(key => { obj[key] = fn[key]; });
  obj.entries = {};
  return obj;
}

function entity(doc, opts = {}) {
  const ent = {};
  if (opts.includeName && doc.name) {
    ent.name = doc.name;
  }
  if (doc.kind === 'class') {
    if (doc.classdesc) {
      ent.description = doc.classdesc;
    }
  } else if (doc.description) {
    ent.description = doc.description;
  }

  Object.assign(ent, tags(doc), availability(doc));

  if (doc.optional) {
    ent.optional = true;
  }
  if (doc.nullable) {
    ent.nullable = true;
  }
  if (doc.variable) {
    ent.rest = true;
  }
  if (doc.type && doc.meta && doc.meta.code && doc.meta.code.type === 'Literal') {
    ent.defaultValue = doc.meta.code.value;
  } else if ('defaultvalue' in doc) { // note - small 'v' is used in jsdoc
    ent.defaultValue = doc.defaultvalue;
  }

  const typedef = getTypedef(doc);
  Object.assign(ent, typedef);

  if (doc.examples) {
    ent.examples = doc.examples;
  }

  return ent;
}

module.exports = {
  collectParams,
  collectProps,
  entity,
  availability,
  tags,
  typedef: getTypedef,
};
