const fs = require('fs');
const winston = require('winston');
const extend = require('extend');
const types = require('./types');
const defaultConfig = require('../spec.config.js');

function filterDoclets(data) {
  return data().get().filter(doc => !doc.undocumented && !doc.ignore);
}

function collect(doclets, cfg, entity = types.doclet) {
  const ids = {};
  const priv = {};
  let pack;

  doclets.forEach(doc => {
    let d;
    if (doc.meta && doc.meta.code.name === 'module.exports') {
      if (doc.longname.indexOf('module.exports') === 0) {
        cfg.logger.warn('Default export without module name:', `${doc.meta.path}/${doc.meta.filename}`);
        return;
      }
    }
    // class
    // constant
    // event
    // external
    // file
    // function
    // member
    // mixin
    // module
    // namespace
    // typedef
    switch (doc.kind) {
      case 'package':
        pack = doc;
        break;
      case 'typedef':
      case 'member':
      case 'constant':
      case 'module':
      case 'function':
      case 'event':
      case 'namespace':
      case 'class':
      case 'interface':
        d = entity(doc, cfg);
        break;
      default:
        cfg.logger.warn('Untreated kind:', doc.kind);
        break;
    }

    if (d) {
      d.__id = doc.longname;
      d.__scopeName = doc.name;
      d.__memberOf = doc.memberof;
      d.__memberScope = doc.scope;
      d.__meta = doc.meta;
      d.__access = doc.access;
      d.__isDefinition = (doc.tags || []).filter(tag => tag.originalTitle === 'definition').length > 0;

      if (ids[d.__id] && ids[d.__id][0] && ids[d.__id][0].kind === 'module') { // 'd' is a default export from a module
        d.__memberOf = d.__id;
        d.__memberScope = 'static';
        d.__scopeName = '@default';
        d.__id += '@default';
      }

      if (ids[d.__id]) {
        cfg.logger.warn(`'${doc.longname}' already exists`);
      }
      const idObj = {};
      const privObj = {};
      ids[d.__id] = ids[d.__id] || [];
      priv[d.__id] = priv[d.__id] || [];
      ids[d.__id].push(idObj);
      priv[d.__id].push(privObj);
      Object.keys(d).forEach(key => {
        if (/^__/.test(key)) {
          privObj[key] = d[key];
        } else {
          idObj[key] = d[key];
        }
      });
    }
  });

  return {
    pack,
    ids,
    priv,
  };
}

const BASIC_TYPES = [
  'boolean',
  'number',
  'string',
  'function',
  'object',
  'array',
  'any',
  'null',
];

function logRule(cfg, rule, ...args) {
  const r = cfg.rules[rule];
  const severity = +r;
  if (severity === 2) {
    cfg.logger.error(...args);
  } else if (severity === 1) {
    cfg.logger.warn(...args);
  }
}

function traverse(obj, priv, cfg) {
  let prop;
  Object.keys(obj).forEach(key => {
    prop = obj[key];
    if (prop == null || typeof prop !== 'object') {
      return;
    }
    if (typeof prop.type === 'string') {
      const generic = prop.type.match((/<.*>/)); // find generic
      const t = prop.type.replace(/<.*>/, ''); // strip generic
      if (priv[prop.type] && priv[prop.type][0].__ref) {
        prop.type = priv[prop.type][0].__ref;
      } else if (cfg.types[t]) {
        if (cfg.types[t].rewrite) {
          prop.type = `${cfg.types[t].rewrite}${generic ? generic[0] : ''}`;
        }
      } else if (BASIC_TYPES.indexOf(prop.type) === -1) {
        logRule(cfg, 'type-unknown', `Unknown type '${prop.type}'`);
      }
    }

    traverse(prop, priv, cfg);
  });
}

function transform({ ids, priv }, cfg) {
  const entries = {};
  const definitions = {};
  Object.keys(ids).forEach(longname => {
    ids[longname].forEach((d, idx) => {
      // const d = ids[longname];
      const pr = priv[longname][idx];
      const memberOf = pr.__memberOf;
      const memberDefault = `${memberOf}@default`;
      const memberScope = pr.__memberScope;
      const scopeName = pr.__scopeName;
      let parent = ids[memberOf] && ids[memberOf][0];
      const access = pr.__access;
      const isDefinition = pr.__isDefinition;

      const parentMaybeDefault = ids[memberDefault] && ids[memberDefault][0];
      if (/^module:/.test(memberOf) && parentMaybeDefault && parentMaybeDefault !== d) {
        if (!/^exports/.test(pr.__meta.code.name)) {
          [parent] = ids[memberDefault];
          pr.__id = pr.__id.replace(memberOf, memberDefault);
        }
      }

      let memberProperty;

      if (access === 'private') {
        return;
      }

      if (parent) {
        if (d.kind === 'event') {
          memberProperty = 'events';
        } else if (memberScope === 'static' && parent && parent.kind === 'class') {
          memberProperty = 'staticEntries';
        } else if (memberScope === 'inner' || isDefinition) {
          memberProperty = 'definitions';
        } else {
          memberProperty = 'entries';
        }

        parent[memberProperty] = parent[memberProperty] || {};
        const ref = `${priv[memberOf][0].__ref}/${memberProperty}/${scopeName}`;
        if (parent[memberProperty][scopeName]) {
          // TODO - add multiple signatures if kind === 'function' ?
          parent[memberProperty][scopeName] = parent[memberProperty][scopeName] || {};
          extend(true, parent[memberProperty][scopeName], d);
          ids[longname][idx] = parent[memberProperty][scopeName]; // eslint-disable-line no-param-reassign
          pr.__ref = ref;
        } else {
          parent[memberProperty][scopeName] = d;
          pr.__ref = ref;
        }
      } else if (memberScope === 'inner' || isDefinition) {
        definitions[pr.__id] = d;
        pr.__ref = `#/definitions/${pr.__id}`;
      } else {
        entries[pr.__id] = d;
        pr.__ref = `#/entries/${pr.__id}`;
      }
    });
  });

  // console.log(priv);
  traverse(entries, priv, cfg);
  traverse(definitions, priv, cfg);

  return {
    entries,
    definitions,
  };
}

function specification({ entries = {}, definitions = {}, pack = {} } = {}, opts) {
  const spec = {
    spec: {
      version: '0.1.0',
    },
    info: {
      name: typeof opts.name !== 'undefined' ? opts.name : pack.name,
      description: typeof opts.description !== 'undefined' ? opts.description : pack.description,
      version: typeof opts.version !== 'undefined' ? opts.version : pack.version,
      license: typeof opts.license !== 'undefined' ? opts.license : (pack.licenses ? pack.licenses[0].type : undefined), // eslint-disable-line
    },
    entries,
    definitions,
  };

  return JSON.stringify(spec, null, 2);
}

function write(JSONSpec, destination) {
  fs.writeFileSync(destination, JSONSpec);
}

function generate({
  taffydata,
  opts,
}) {
  const config = extend(true, {}, defaultConfig, opts);
  // filter doclets
  const doclets = filterDoclets(taffydata);

  // collect doclets based on longname
  const collected = collect(doclets, config);

  // transform
  const { entries, definitions } = transform(collected, config);

  // create spec
  const spec = specification({
    entries,
    definitions,
    pack: collected.pack,
  }, config);

  // validate spec against schema
  // validateSpec(JSON.parse(JSONSpec), schema);

  return spec;
}

const wlogger = new winston.Logger({
  level: 'verbose',
  transports: [
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
    }),
  ],
});

function jsdocpublish(taffydata, jsdocopts) {
  const opts = {
    stability: {},
    logger: wlogger,
  };

  const spec = generate({
    taffydata,
    jsdocopts,
    opts,
  });

  // write
  write(spec, jsdocopts.destination);
}

module.exports = {
  filterDoclets,
  collect,
  generate,
  transform,
  jsdocpublish,
  logRule,
};
