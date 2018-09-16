/* eslint no-use-before-define: 0 */
/* eslint no-param-reassign: 0 */
/* eslint prefer-destructuring: 0 */

// TODO
// symbols
// generic templates
// meta - see, links

const EXCLUDE_TAGS = ['entry'];
const VENDOR_TAG_RX = /^x-/;

const STABILITY_TAGS = ['experimental', 'stable', 'locked'];
const STABILITY = 'stability';

let currentMetaDoc;

function tags(doc, cfg) {
  const o = {};

  let include = false;
  let exclude = false;

  if (cfg && cfg.parse && cfg.parse.tags) {
    include = Array.isArray(cfg.parse.tags.include) ? cfg.parse.tags.include : false;
    exclude = !include && Array.isArray(cfg.parse.tags.exclude) ? cfg.parse.tags.exclude : false;
  }

  (doc.tags || []).forEach(tag => {
    if (tag.title === STABILITY) {
      if (STABILITY_TAGS.indexOf(tag.value) !== -1) {
        o.stability = tag.value;
      } else {
        cfg.logRule(doc, 'no-unknown-stability', `Stability unknown: '${tag.value}'`);
      }
    } else if (STABILITY_TAGS.indexOf(tag.title) !== -1) {
      o.stability = tag.title;
    } else if (tag.title === 'template') {
      // reserve for later - TODO
      // o.templates = tag.value.split(/,\s*/);
    } else if (EXCLUDE_TAGS.indexOf(tag.title) !== -1 || (include && include.indexOf(tag.title) === -1) || (exclude && exclude.indexOf(tag.title) !== -1)) {
      // do nothing
    } else if (VENDOR_TAG_RX.test(tag.title)) {
      o[tag.title] = typeof tag.value !== 'undefined' ? tag.value : true;
    } else {
      o[`x-${tag.title}`] = typeof tag.value !== 'undefined' ? tag.value : true;
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

function literal(v) {
  if (v[0] === '\'' || v[0] === '"') {
    return 'string';
  }
  if (v === 'false' || v === 'true') {
    return 'boolean';
  }
  if (!Number.isNaN(+v)) {
    return 'number';
  }
  return false;
}

function simpleType(type, cfg) {
  const t = {
    type: type.replace(/\.</g, '<'),
  };

  if (t.type === 'Promise') {
    cfg.logRule(currentMetaDoc, 'no-unknown-promise', 'Promise is missing type');
  }

  const lit = literal(t.type);
  if (lit) {
    return {
      kind: 'literal',
      value: lit === 'number' ? +t.type : t.type,
    };
  }

  return t;
}

function commonType(names) {
  const types = {};

  names.forEach((v) => {
    const lit = literal(v) || 'any';
    types[lit] = (types[lit] || 0) + 1;
  });
  const frequency = Object.keys(types).sort((a, b) => types[a] - types[b]);

  return frequency.length === 1 ? frequency[0] : undefined;
}

function parseName(type) {
  return type.split(/\s*,\s*/).map(t => getTypedef({ type: { names: [t.replace(/\s*/g, '')] } }));
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
    typedef.items = itemtype.split(/\s*,\s*/).map(t => getTypedef({ type: { names: [t] } }));
  } else {
    itemtype = itemtype.replace(/\s*\(\s*|\s*\)/g, '').split(/\s*\|\s*/);
    typedef.items = getTypedef({
      type: { names: itemtype },
    }, cfg, opts);
  }

  return typedef;
}

function unwrapGeneric(type, cfg, opts) {
  const itemtype = type.match(/<(.+)>/);
  if (itemtype) {
    const t = type.replace(itemtype[0], '').replace(/\.$/g, '');
    return {
      type: t,
      generics: parseName(itemtype[1], cfg, opts),
    };
  }
  return {
    type: 'any',
  };
}

function typeOrKind(names, cfg, opts) {
  if (names.length === 0) {
    throw new Error('ooops');
  }
  if (names.length === 1) {
    return simpleType(names[0], cfg, opts);
  }
  return {
    kind: 'union',
    type: commonType(names),
    items: names.map(t => getTypedef({ type: { names: [t] } }, cfg, opts)),
  };
}

function getTypedef(doc, cfg, opts) {
  let type;
  const typedef = {};
  if (doc.kind === 'module') {
    return kindModule(doc, cfg, opts);
  }
  if (doc.kind === 'namespace') {
    return kindNamespace(doc, cfg, opts);
  }
  if (doc.kind === 'function') {
    return kindFunction(doc, cfg, opts);
  }
  if (doc.kind === 'event') {
    const t = kindFunction(doc, cfg, opts);
    t.kind = 'event';
    return t;
  }
  if (doc.kind === 'class') {
    return kindClass(doc, cfg, opts);
  }
  if (doc.kind === 'interface') {
    return kindInterface(doc, cfg, opts);
  }
  if (!doc.type || !doc.type.names) {
    const t = getTypeFromCodeMeta(doc, cfg, opts);
    if (!t.kind) {
      if (doc.kind === 'member' && doc.params && doc.meta && doc.meta.code && doc.meta.code.paramnames && doc.meta.code.paramnames.length === 1) { // property setter
        const something = typeOrKind(doc.params[0].type.names);
        if (something.kind) {
          typedef.kind = something.kind;
          typedef.items = something.items;
        } else if (something.type) {
          type = something.type;
        }
      } else {
        if (!cfg.__private) {
          if (doc && doc.meta && doc.name) {
            cfg.logRule(doc, 'no-missing-types', `Missing type on '${doc.name}'`);
          } else {
            cfg.logRule(currentMetaDoc, 'no-missing-types', 'Missing type');
          }
        }
        type = 'any';
      }
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
    if (doc.type.names[0] === 'function') {
      return doc.kind === 'typedef' ? kindFunction(doc, cfg, opts) : {
        type: 'function',
      };
    }
    const something = typeOrKind(doc.type.names, cfg, opts);
    if (something.kind === 'literal') {
      typedef.kind = something.kind;
      typedef.value = something.value;
      return typedef;
    }
    [type] = doc.type.names;
  } else {
    const something = typeOrKind(doc.type.names, cfg, opts);
    typedef.kind = something.kind;
    typedef.items = something.items;
    typedef.type = something.type;
  }

  if (type === 'object') {
    const entries = collectProps(doc.properties, cfg, opts);
    if (doc.kind || Object.keys(entries).length) {
      typedef.kind = 'object';
      typedef.entries = entries;
    }
  }

  if (/^Array\.</.test(type) || type === 'array') {
    return unwrapArrayGeneric(type, cfg, opts);
  }
  if (/\.</.test(type)) { // generic
    return unwrapGeneric(type, cfg, opts);
  }
  if (/\|/.exec(type)) {
    return {
      kind: 'union',
      items: type.split(/\s*\|\s*/).map(t => getTypedef({ type: { names: [t.replace(/^\s*\(?\s*|\s*\)?\s*$/g, '')] } }, cfg, opts)),
    };
  }
  if (type && ((type !== typedef.kind) || !typedef.kind)) {
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
      cfg.logRule(doc, 'no-multi-return', 'Multiple returns from function');
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

  if (doc.exceptions) {
    f.throws = doc.exceptions.map(xc => entity(xc, cfg, opts));
  }

  if (doc.fires && doc.fires.length) {
    f.emits = doc.fires.map(t => simpleType(t, cfg, opts));
  }

  if (doc.this) {
    f.this = simpleType(doc.this, cfg, opts);
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
  const entries = doc.properties ? collectProps(doc.properties, cfg, opts) : {};
  return {
    kind: 'class',
    constructor: {
      kind: 'function',
      description: doc.description,
      params: constr.params,
    },
    entries,
  };
}

function kindInterface(doc, cfg, opts) {
  const fn = kindFunction(doc, cfg, opts);
  const obj = {
    kind: 'interface',
  };
  Object.keys(fn).filter(key => key !== 'kind').forEach(key => { obj[key] = fn[key]; });
  if (!doc.params) {
    delete obj.params;
  }
  obj.entries = doc.properties ? collectProps(doc.properties, cfg, opts) : {};
  return obj;
}

const inlineTags = [
  'since',
  'deprecated',
  STABILITY,
  ...STABILITY_TAGS,
].map(t => ({
  rx: new RegExp(`\\s*\\{@${t}\\s*([^}]*)\\}`),
  tag: t,
}));

function extractTags(doc) {
  let s = '';
  if (doc.kind === 'class') {
    if (doc.classdesc) {
      s = doc.classdesc;
    }
  } else if (doc.description) {
    s = doc.description;
  }
  inlineTags.forEach(t => {
    const m = t.rx.exec(s);
    if (m) {
      s = s.replace(m[0], '');
      if (t.tag === 'since') {
        doc.since = m[1];
      } else if (t.tag === 'deprecated') {
        doc.deprecated = m[1];
      } else {
        if (!doc.tags) {
          doc.tags = [];
        }
        doc.tags.push({
          originalTitle: t.tag,
          title: t.tag,
          text: m[1],
        });
      }
    }
  });

  return s;
}

function entity(doc, cfg = {}, opts = {}) {
  const ent = {};
  if (doc && doc.meta) {
    currentMetaDoc = doc;
  }
  if (opts.includeName && doc.name) {
    ent.name = doc.name;
  }

  const descr = extractTags(doc);
  if (descr) {
    ent.description = descr;
  }

  Object.assign(ent, tags(doc, cfg), availability(doc));

  if (doc.optional) {
    ent.optional = true;
  }
  if (doc.nullable) {
    ent.nullable = true;
  }
  if (doc.variable) {
    ent.variable = true;
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
  if (typedef.type === 'Promise' && !typedef.generics) {
    cfg.logRule(currentMetaDoc, 'no-unknown-promise', 'Promise is missing type');
  }
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
