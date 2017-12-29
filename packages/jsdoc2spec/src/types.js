/* eslint no-use-before-define: 0 */
/* eslint no-param-reassign: 0 */

// TODO
// get/set
// symbols
// errors
// meta - examples, see, links, inline tags

const EXCLUDE_TAGS = ['definition'];
const VENDOR_TAG_RX = /^x-/;

function tags(doc) {
  const o = {};

  (doc.tags || []).forEach(tag => {
    if (EXCLUDE_TAGS.indexOf(tag.title) !== -1) {
      // do nothing
    } else if (tag.title === 'stability') {
      o.stability = +tag.value;
    } else if (VENDOR_TAG_RX.test(tag.title)) {
      o[tag.title] = tag.value;
    } else {
      o[`x-${tag.title}`] = tag.value;
    }
  });

  return o;
}

const SINCE_RX = /^(?:Deprecated\s)?since\s(\d+\.\d+.\d+)/;

function availability(doc /* opts */) {
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


function collectAndNest(params, cfg, opts, isParams = false) {
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
        delete parent.type;
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
        // if (!parent.kind) {
        //   parent.kind = 'struct';
        //   delete parent.type;
        // }
        parent.entries = {};
      }
      delete parent.type;
      parent = isParentArray ? parent.items.entries : parent.entries;
    }
    const obj = {};
    if (isParams && i === 0 && par.name) {
      obj.name = par.name;
    }
    parent[s[i]] = Object.assign(obj, entity(par, cfg, opts));

    if (i === 0) {
      res.push(parent[s[i]]);
    }
  });

  return isParams ? res : paramMap;
}

function collectParams(params, cfg, opts) {
  return collectAndNest(params, cfg, opts, true);
}

// collect nested properties
function collectProps(props, cfg, opts) {
  return collectAndNest(props, cfg, opts);
}

function getTypeFromCodeMeta(doc /* opts */) {
  const o = {};
  if (!doc.meta || !doc.meta.code) {
    // console.warn('--UNKNOWN--', doc.longname);
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

function unwrapArrayGeneric(type, cfg, opts) {
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
    typedef.items = itemtype.split(',').map(t => getTypedef({ type: { names: [t.replace(/\s+/g, '')] } }));
  } else {
    typedef.items = getTypedef({
      type: { names: [itemtype] },
    }, cfg, opts);
  }

  return typedef;
}

function getTypedef(doc, cfg, opts) {
  let type;
  const typedef = {};
  if (doc.kind === 'module') {
    return kindModule(doc, cfg, opts);
  } else if (doc.kind === 'namespace') {
    return kindNamespace(doc, cfg, opts);
  } else if (doc.kind === 'function') {
    return kindFunction(doc, cfg, opts);
  } else if (doc.kind === 'event') {
    const t = kindFunction(doc, cfg, opts);
    t.kind = 'event';
    return t;
  } else if (doc.kind === 'class') {
    return kindClass(doc, cfg, opts);
  } else if (doc.kind === 'interface') {
    return kindInterface(doc, cfg, opts);
  } else if (!doc.type || !doc.type.names) {
    const t = getTypeFromCodeMeta(doc, cfg, opts);
    if (!t.kind) {
      if (!cfg.__private) {
        cfg.logger.warn(`Unknown type on '${doc.longname || doc.name}' in ${cfg.__path}`);
      }
      type = 'any';
    } else {
      type = t.kind;
      typedef.kind = type;
      if (type === 'literal' && 'value' in t) {
        typedef.value = t.value;
        typedef.kind = t.kind;
        return typedef;
      }
    }
  } else if (doc.type.names.length === 1) {
    [type] = doc.type.names;
    if (type === 'function') {
      return doc.kind === 'typedef' ? kindFunction(doc, cfg, opts) : {
        type: 'function',
      };
    }
  } else {
    typedef.kind = 'union';
    typedef.items = doc.type.names.map(t => simpleType(t, cfg, opts));
  }

  if (type === 'object') {
    const entries = collectProps(doc.properties, cfg, opts);
    if (doc.kind || Object.keys(entries).length) {
      typedef.kind = doc.kind === 'typedef' ? 'struct' : 'object';
      typedef.entries = entries;
    }
  }

  if (/Array\.</.test(type) || type === 'array') {
    return unwrapArrayGeneric(type, cfg, opts);
  } else if (/\.</.test(type)) { // generic
    typedef.type = type.replace(/\.</g, '<');
  } else if (type && ((type !== typedef.kind) || !typedef.kind)) {
    typedef.type = type;
  }

  return typedef;
}

function kindFunction(doc, cfg, opts) {
  const f = {
    kind: 'function',
    params: [],
  };

  f.params.push(...collectParams(doc.params || [], cfg, opts));

  if (doc.returns) {
    if (doc.returns.length > 1) {
      cfg.logger.warn('Multiple returns from ', doc.longname);
    }
    f.returns = entity(doc.returns[0], cfg, opts);
  }

  if (doc.async) {
    f.async = true;
  }

  if (doc.generator || doc.yields) {
    f.generator = true;
    if (doc.yields && doc.yields.length > 1) {
      f.yields = {
        kind: 'union',
        items: doc.yields.map(y => entity(y, cfg, opts)),
      };
    } else if (doc.yields) {
      f.yields = entity(doc.yields[0], cfg, opts);
    }
  }

  if (doc.fires && doc.fires.length) {
    f.emits = doc.fires.map(t => simpleType(t, cfg));
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

function kindClass(doc, cfg, opts) {
  const constr = kindFunction(doc, cfg, opts);
  return {
    kind: 'class',
    constructor: {
      description: doc.description,
      params: constr.params,
    },
    entries: {},
  };
}

function kindInterface(doc, cfg, opts) {
  const fn = kindFunction(doc, cfg, opts);
  const obj = {
    kind: 'interface',
  };
  Object.keys(fn).filter(key => key !== 'kind').forEach(key => { obj[key] = fn[key]; });
  obj.entries = {};
  return obj;
}

function entity(doc, cfg = {}, opts = {}) {
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

  // if (typeof ent.stability === 'undefined' && typeof opts.stability.default) {
  //   ent.stability = opts.stability.default;
  // }

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
  if (doc.implements) {
    ent.implements = doc.implements.map(simpleType);
  }
  if (doc.augments) {
    ent.extends = doc.augments.map(simpleType);
  }

  const typedef = getTypedef(doc, cfg, opts);
  Object.assign(ent, typedef);

  if (doc.examples) {
    ent.examples = doc.examples;
  }

  return ent;
}

function doclet(doc, cfg) {
  cfg.__path = `${doc.meta.path}/${doc.meta.filename}`;
  cfg.__private = doc.access === 'private';
  return entity(doc, cfg);
}

module.exports = {
  collectParams,
  collectProps,
  entity,
  doclet,
  availability,
  tags,
  typedef: getTypedef,
};
