/* eslint no-param-reassign: 0 */

const fs = require('fs');
const winston = require('winston');
const extend = require('extend');
const jsAPISpec = require('js-api-spec');
const types = require('./types');
const defaultConfig = require('../spec.config.js');

const wlogger = new winston.Logger({
  level: 'verbose',
  transports: [
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
    }),
  ],
});

wlogger.cli();

// const ruleViolations = {};

function printViolations(violations, logger = console) {
  // formatting kinda ripped from https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js
  // let warnings = 0;
  let errs = 0;
  Object.keys(violations).forEach(file => {
    const vs = violations[file];
    if (file) {
      logger.log(`\n\x1b[4m${file}\x1b[0m`);
    } else {
      logger.log('\nType check\x1b[0m');
    }
    vs.forEach(violation => {
      const position = violation.doc && violation.doc.meta ? `\x1b[2m${violation.doc.meta.lineno}:${violation.doc.meta.columnno}\x1b[0m` : '';
      const rule = `\x1b[2m${violation.rule}\x1b[0m`;
      const severity = violation.severity === 2 ? '\x1b[31merror\x1b[0m' : '\x1b[33mwarn\x1b[0m';
      const message = `  ${position}\t${severity}\t${violation.message}\t${rule}`;
      logger.log(message);
      if (violation.severity === 2) {
        errs += 1;
      }
    });
  });

  return errs;
}

function logRule(cfg, doc, rule, message, violations) {
  const r = cfg.parse.rules[rule];
  const severity = +r;
  if (severity <= 0) {
    return;
  }

  const id = doc && doc.meta ? `${doc.meta.path}/${doc.meta.filename}` : '';
  violations[id] = violations[id] || [];
  const fileViolations = violations[id];
  fileViolations.push({
    rule,
    severity,
    doc,
    message,
  });
}

function filterDoclets(data) {
  return data.filter(doc => !doc.undocumented && !doc.ignore);
}

function collect(doclets, cfg, entity = types.doclet) {
  const ids = {};
  const priv = {};
  let pack;

  doclets.forEach(doc => {
    let d;
    if (doc.meta && doc.meta.code.name === 'module.exports') {
      if (doc.longname.indexOf('module.exports') === 0) {
        cfg.logRule(doc, 'no-default-exports-wo-name', 'Default export without module name');
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
        cfg.logRule(doc, 'no-untreated-kinds', `Untreated kind '${doc.kind}`);
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

      if (ids[d.__id && d.__access !== 'private']) {
        cfg.logRule(doc, 'no-duplicate-references', `'${doc.longname}' already exists`);
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
      } else if (cfg.parse.types[t]) {
        if (cfg.parse.types[t].rewrite) {
          prop.type = `${cfg.parse.types[t].rewrite}${generic ? generic[0] : ''}`;
        }
      } else if (BASIC_TYPES.indexOf(t) === -1) {
        cfg.logRule(null, 'no-unknown-types', `Type unknown: '${prop.type}'`);
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
      version: '0.x',
    },
    info: {
      name: typeof opts.api.name !== 'undefined' ? opts.api.name : pack.name,
      description: typeof opts.api.description !== 'undefined' ? opts.api.description : pack.description,
      version: typeof opts.api.version !== 'undefined' ? opts.api.version : pack.version,
      license: typeof opts.api.license !== 'undefined' ? opts.api.license : (pack.licenses ? pack.licenses[0].type : undefined), // eslint-disable-line
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
  data,
  config,
}) {
  // filter doclets
  const doclets = filterDoclets(data);

  config.logger = wlogger; // eslint-disable-line
  const violations = {};
  config.logRule = (doc, rule, message) => logRule(config, doc, rule, message, violations);

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

  const errors = printViolations(violations);

  // validate spec against schema
  if (config.spec.validate !== false) {
    jsAPISpec.validate(JSON.parse(spec));
  }

  if (errors > 0) {
    process.exitCode = 1;
  }

  return spec;
}

function jsdocpublish(taffydata, jsdocopts) {
  const config = defaultConfig;
  if (jsdocopts.destination) {
    config.output.file = jsdocopts.destination;
  }

  const spec = generate({
    data: taffydata().get(),
    config,
  });

  // write
  write(spec, config.output.file);
}

module.exports = {
  filterDoclets,
  collect,
  generate,
  transform,
  jsdocpublish,
  logRule,
  write,
};
