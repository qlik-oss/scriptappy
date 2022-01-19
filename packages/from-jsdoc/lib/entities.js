/* eslint no-use-before-define: 0 */
/* eslint no-param-reassign: 0 */
/* eslint prefer-destructuring: 0 */

// TODO
// meta - see, links

const EXCLUDE_TAGS = ['entry'];
const VENDOR_TAG_RX = /^x-/;

const STABILITY_TAGS = ['experimental', 'stable', 'locked'];
const STABILITY = 'stability';

let currentMetaDoc;

const { parse, getTypeFromCodeMeta, getTypedefFromComment, getReturnFromComment } = require('./type-parser');
const collector = require('./collector');

const { collectPropsFromDoc, collectParamsFromDoc } = collector({ entity });

function tags(doc, cfg) {
  const o = {};

  let include = false;
  let exclude = false;

  if (cfg && cfg.parse && cfg.parse.tags) {
    include = Array.isArray(cfg.parse.tags.include) ? cfg.parse.tags.include : false;
    exclude = !include && Array.isArray(cfg.parse.tags.exclude) ? cfg.parse.tags.exclude : false;
  }

  (doc.tags || []).forEach((tag) => {
    if (tag.title === STABILITY) {
      if (STABILITY_TAGS.indexOf(tag.value) !== -1) {
        o.stability = tag.value;
      } else {
        cfg.logRule(doc, 'no-unknown-stability', `Stability unknown: '${tag.value}'`);
      }
    } else if (STABILITY_TAGS.indexOf(tag.title) !== -1) {
      o.stability = tag.title;
    } else if (tag.title === 'template') {
      o.templates = o.templates || [];
      let tt = {
        name: tag.value.name,
      };
      // add dummy type to avoid missing type warning
      const ttt = entity({ type: { names: ['string'] }, ...tag.value }, cfg);
      if (tag.value.type) {
        tt = {
          name: tag.value.name,
          ...ttt,
        };
      }
      if (typeof ttt.defaultValue !== 'undefined') {
        tt.defaultValue = ttt.defaultValue;
      }
      o.templates.push(tt);
    } else if (
      EXCLUDE_TAGS.indexOf(tag.title) !== -1 ||
      (include && include.indexOf(tag.title) === -1) ||
      (exclude && exclude.indexOf(tag.title) !== -1)
    ) {
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

function literal(v) {
  if (v[0] === "'" || v[0] === '"') {
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

function augmentObject(typedef, doc, cfg, opts) {
  if ((typedef.kind === 'object' || typedef.type === 'object') && doc.properties) {
    delete typedef.type;
    typedef.kind = 'object';
    typedef.entries = collectPropsFromDoc(doc, cfg, opts);
  }
}

function getTypedef(doc, cfg, opts) {
  let typedef;
  if (doc.exp) {
    return parse(doc.exp);
  }
  if (!doc.kind && !doc.type && !doc.meta) {
    return {
      type: 'any',
    };
  }
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
  if (doc.isEnum) {
    return kindEnum();
  }
  if (doc.kind === 'typedef' && (doc.params || /@callback/.test(doc.comment))) {
    return kindFunction(doc, cfg, opts);
  }
  if (doc.kind === 'typedef' && doc.comment && doc.comment.match(/@typedef/)) {
    const exp = getTypedefFromComment(doc.comment);
    typedef = parse(exp);
    augmentObject(typedef, doc, cfg, opts);
    if (doc.scope === 'global') {
      return kindAlias(typedef);
    }
    return typedef;
  }
  if (!doc.type || !doc.type.names) {
    const t = getTypeFromCodeMeta(doc, cfg, opts);
    if (!t.kind && !t.type) {
      if (!cfg.__private) {
        if (doc && doc.meta && doc.name) {
          cfg.logRule(doc, 'no-missing-types', `Missing type on '${doc.name}'`);
        } else {
          cfg.logRule(currentMetaDoc, 'no-missing-types', 'Missing type');
        }
      }
    } else {
      typedef = t;
    }
  } else if (doc.type.names.length === 1) {
    typedef = parse(doc.type.names[0]);
  } else {
    typedef = {
      kind: 'union',
      items: doc.type.names.map((t) => parse(t)),
    };
  }
  if (!typedef) {
    typedef = { type: 'any' };
  }

  augmentObject(typedef, doc, cfg, opts);

  return typedef;
}

function kindFunction(doc, cfg, opts) {
  const f = {
    kind: 'function',
    params: [],
  };

  f.params.push(...collectParamsFromDoc(doc, cfg, opts));

  if (doc.returns) {
    if (doc.returns.length > 1) {
      cfg.logRule(doc, 'no-multi-return', 'Multiple returns from function');
    }
    doc.returns[0].exp = getReturnFromComment(doc.comment);
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
        items: doc.yields.map((y) => entity(y, cfg, opts)),
      };
    } else if (doc.yields) {
      f.yields = entity(doc.yields[0], cfg, opts);
    }
  }

  if (doc.exceptions) {
    f.throws = doc.exceptions.map((xc) => entity(xc, cfg, opts));
  }

  if (doc.fires && doc.fires.length) {
    f.emits = doc.fires.map((t) => simpleType(t, cfg, opts));
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

function kindAlias(type) {
  return {
    kind: 'alias',
    items: type,
  };
}

function kindEnum() {
  return {
    kind: 'enum',
    entries: {},
  };
}

function kindClass(doc, cfg, opts) {
  const constr = kindFunction(doc, cfg, opts);
  const entries = doc.properties ? collectPropsFromDoc(doc, cfg, opts) : {};
  return {
    kind: 'class',
    ...(doc.hideconstructor
      ? {}
      : {
          constructor: {
            kind: 'function',
            description: doc.description,
            params: constr.params,
          },
        }),
    entries,
  };
}

function kindInterface(doc, cfg, opts) {
  const fn = kindFunction(doc, cfg, opts);
  const obj = {
    kind: 'interface',
  };
  let numProps = 0; // number of props specific to the function kind (except params)
  Object.keys(fn)
    .filter((key) => key !== 'kind')
    .forEach((key) => {
      obj[key] = fn[key];
      if (key !== 'params') {
        numProps++;
      }
    });

  // if the entity is a comment only and does not have an AST node,
  // do not treat it as a functional interface if it does not have any
  // functional properties
  if (!doc.meta.code.type && !numProps && !obj.params.length) {
    delete obj.params;
  } else if (doc.meta.code && doc.meta.code.type === 'ObjectExpression') {
    delete obj.params;
  }

  obj.entries = doc.properties ? collectPropsFromDoc(doc, cfg, opts) : {};
  return obj;
}

const inlineTags = ['since', 'deprecated', STABILITY, ...STABILITY_TAGS].map((t) => ({
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
  inlineTags.forEach((t) => {
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

  const valueProp = typedef.kind === 'literal' ? 'value' : 'defaultValue';

  if (doc.type && doc.meta && doc.meta.code && doc.meta.code.type === 'Literal') {
    ent[valueProp] = doc.meta.code.value;
  } else if (
    doc.type &&
    doc.meta &&
    doc.meta.code &&
    doc.meta.code.type === 'UnaryExpression' &&
    typedef.type === 'number'
  ) {
    ent[valueProp] = Number(doc.meta.code.value);
  } else if ('defaultvalue' in doc) {
    // note - small 'v' is used in jsdoc
    if (typedef.type === 'boolean') {
      ent[valueProp] = doc.defaultvalue === true || doc.defaultvalue === 'true';
    } else {
      ent[valueProp] = doc.defaultvalue;
    }
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
  entity,
  doclet,
  availability,
  tags,
  typedef: getTypedef,
};
