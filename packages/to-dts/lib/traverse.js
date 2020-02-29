const dom = require('dts-dom');

const VALID_MEMBERS = {
  class: ['property', 'method', 'index-signature', 'constructor'],
  enum: ['enum-value'],
  module: ['interface', 'alias', 'class', 'namespace', 'const', 'var', 'function'],
  namespace: ['interface', 'alias', 'class', 'namespace', 'const', 'var', 'function', 'enum'],
  interface: ['property', 'method', 'index-signature', 'call-signature'],
  object: ['property', 'method', 'index-signature', 'call-signature'],
};

const VALID_TOP_LEVEL = [
  'interface',
  'function',
  'class',
  'namespace',
  'const',
  'var',
  'alias',
  'export=',
  'exportDefault',
  'exportName',
  'module',
  'importAll',
  'importDefault',
  'importNamed',
  'import=',
  'import',
  'enum',
];

function traverseFn(g) {
  return (obj, { parent: tsParent, path = '', flags = '' }) => {
    const arr = [];
    Object.keys(obj || {}).forEach(key => {
      const p = `${path}/${key}`;
      const def = obj[key];
      const tsType = g.getType(
        {
          name: key,
          path: p,
          ...def,
        },
        tsParent
      );
      if (flags) {
        tsType.flags = flags | (tsType.flags || 0);
      }
      if (tsParent) {
        if (VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes(tsType.kind)) {
          if (def.optional) {
            tsType.flags = (tsType.flags || 0) | dom.DeclarationFlags.Optional;
          }
          tsParent.members.push(tsType);
        } else if (VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes('property')) {
          const propType = dom.create.property(key, tsType, def.optional ? dom.DeclarationFlags.Optional : 0);
          tsParent.members.push(propType);
        } else if (VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes('alias')) {
          const propType = dom.create.alias(key, tsType, def.optional ? dom.DeclarationFlags.Optional : 0);
          tsParent.members.push(propType);
        } else {
          console.warn(`${tsParent.kind} '${tsParent.name}' can not have members of type '${tsType.kind}'`);
        }
      } else if (!VALID_TOP_LEVEL.includes(tsType.kind)) {
        const ali = dom.create.alias(key, tsType);
        arr.push(ali);
      } else {
        arr.push(tsType);
      }

      if (def.entries) {
        arr.push(...g.traverse(def.entries, { parent: tsType, path: `${p}/entries`, flags: 0 }));
      }
      if (def.staticEntries) {
        arr.push(
          ...g.traverse(def.staticEntries, {
            parent: tsType,
            path: `${p}/staticEntries`,
            flags: dom.DeclarationFlags.Static,
          })
        );
      }

      if (def.events) {
        arr.push(...g.traverse(def.events, { parent: tsType, path: `${p}/events`, flags: 0 }));
      }

      if (def.definitions) {
        const ns = dom.create.namespace(key);
        if (tsParent && VALID_MEMBERS[tsParent.kind] && VALID_MEMBERS[tsParent.kind].includes('namespace')) {
          tsParent.members.push(ns);
        } else {
          arr.push(ns);
        }
        arr.push(...g.traverse(def.definitions, { parent: ns, path: `${p}/definitions`, flags: 0 }));
      }
    });
    return arr;
  };
}

module.exports = traverseFn;
