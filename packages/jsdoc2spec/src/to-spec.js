const fs = require("fs");
const types = require("./types");

function filterDoclets(data) {
  return data().get().filter(doc => !doc.undocumented && !doc.ignore);
}

function collect(doclets) {
  const ids = {};
  let priv = {};
  let package;

  doclets.forEach(doc => {
    let d;
    if (doc.meta && doc.meta.code.name === "module.exports") {
      if (doc.longname.indexOf('module.exports') === 0) {
        console.warn('WARN: Default export without module name:', doc.meta.path + '/' + doc.meta.filename);
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
    switch(doc.kind) {
      case 'package':
        package = doc;
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
        d = types.entity(doc);
      break;
      default:
        console.warn('WARN: Untreated kind:', doc.kind);
      break;
    }

    if (d) {
      d.__id = doc.longname;
      d.__scopeName = doc.name;
      d.__memberOf = doc.memberof;
      d.__memberScope = doc.scope;
      d.__meta = doc.meta;
      d.__access = doc.access;
      d.__isDefinition = (doc.tags || []).filter(tag => tag.originalTitle === 'definition').length > 0;

      if (ids[d.__id] && ids[d.__id].kind === 'module') { // 'd' is a default export from a module
        d.__memberOf = d.__id;
        d.__memberScope = 'static';
        d.__scopeName = '@default';
        d.__id = d.__id + '@default';
      }
      // TODO - check if id already exists and do something about it (in order to support e.g. multiple method signatures)
      ids[d.__id] = {};
      priv[d.__id] = {};
      Object.keys(d).forEach(key => {
        if (/^__/.test(key)) {
          priv[d.__id][key] = d[key];
        } else {
          ids[d.__id][key] = d[key];
        }
      });
    }
  });

  return {
    package,
    ids,
    priv
  }
}

function transform({ids, priv}) {
  const entries = {};
  const definitions = {};
  Object.keys(ids).forEach(longname => {
    const d = ids[longname];
    const pr = priv[longname];
    let memberOf = pr.__memberOf;
    let memberScope = pr.__memberScope;
    let scopeName = pr.__scopeName;
    let parent = ids[memberOf];
    let access = pr.__access;
    const isDefinition = pr.__isDefinition;

    let parentMaybeDefault = ids[memberOf + '@default'];
    if (/^module:/.test(memberOf) && parentMaybeDefault && parentMaybeDefault !== d) {
      if (!/^exports/.test(pr.__meta.code.name)) {
        parent = ids[memberOf + '@default'];
        pr.__id = pr.__id.replace(memberOf, memberOf + '@default');
      }
    }

    let memberProperty;

    if (access === "private") {
      return;
    }

    if (parent) {
      if (d.typedef.kind === 'event') {
        memberProperty = 'events';
        parent = parent.typedef;
      } else if (memberScope === 'static' && parent.typedef && parent.typedef.kind === 'class') {
        memberProperty = 'staticEntries'
        parent = parent.typedef;
      } else if (memberScope === 'static' && parent.typedef && parent.typedef.kind === 'module') {
        memberProperty = 'entries'
        parent = parent.typedef;
      } else if (memberScope === 'inner' || isDefinition) {
        parent = parent.typedef;
        memberProperty = 'definitions';
      } else {
        memberProperty = 'entries';
        parent = parent.typedef;
      }

      if (memberProperty && parent) {
        parent[memberProperty] = parent[memberProperty] || {};
        if (parent[memberProperty][scopeName]) {
          console.log('exists?', longname, scopeName, parent[memberProperty][scopeName]);
        }
        parent[memberProperty][scopeName] = d;
      }
    } else if (memberScope === 'inner' || isDefinition) {
      definitions[pr.__id] = d;
    } else {
      entries[pr.__id] = d;
    }
  });

  return {
    entries,
    definitions
  };
}

function specification({ entries = {}, definitions = {}, package = {}} = {}) {
  const spec = {
    spec: {
      version: '0.1.0',
    },
    info: {
      name: package.name,
      description: package.description,
      version: package.version,
      license: package.licenses ? package.licenses[0].type : undefined
    },
    entries: entries,
    definitions: definitions
  };

  return JSON.stringify(spec, null, 2);
}

function validate() {

}

function write(JSONSpec, destination) {
  fs.writeFileSync(destination, JSONSpec);
}

function publish(data, opts) {
  // filter doclets
  const doclets = filterDoclets(data);

  // collect doclets based on longname
  const collected = collect(doclets, types);

  // transform
  const { entries, definitions } = transform(collected);

  // create spec
  const spec = specification({
    entries,
    definitions,
    package: collected.package
  });

  // validate spec against schema
  // validateSpec(JSON.parse(JSONSpec), schema);

  // write
  write(spec, opts.destination);
}

module.exports = {
  filterDoclets,
  collect,
  publish
};
