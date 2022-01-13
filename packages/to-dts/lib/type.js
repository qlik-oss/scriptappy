const dom = require('dts-dom');

const arr = require('./types/array');
const fn = require('./types/function');
const iface = require('./types/interface');
const alias = require('./types/alias');
const klass = require('./types/class');
const enm = require('./types/enum');
const reference = require('./types/reference');
const union = require('./types/union');
const event = require('./types/event');
const typeParams = require('./types/type-params');

const comments = require('./comments');

const primitives = [
  'string',
  'number',
  'boolean',
  'any',
  'void',
  'object',
  'null',
  'undefined',
  'true',
  'false',
  'this',
];

function typeFn(g) {
  const refs = {};

  const getBase = (def, tsParent) => {
    if (!def.kind && /^#\//.test(def.type)) {
      const uid = `${def.type}${def.generics ? JSON.stringify(def.generics) : ''}`;
      if (!refs[uid]) {
        refs[uid] = reference(def.type, tsParent, g);
      }
      return refs[uid];
    }

    let t;

    // ====== kinds ===========
    switch (def.kind) {
      case 'module':
        return dom.create.module(def.name);
      case 'namespace':
        return dom.create.namespace(def.name);
      case 'object':
        return dom.create.objectType([]);
      case 'alias':
        return alias(def, tsParent, g);
      case 'class':
        return klass(def, tsParent, g);
      case 'enum':
        return enm(def, tsParent, g);
      case 'function':
        return fn(def, tsParent, g);
      case 'interface':
        return iface(def, tsParent, g);
      case 'array':
        return arr(def, tsParent, g);
      case 'union':
        return union(def, tsParent, g);
      case 'event':
        return event(def, tsParent, g);
      default:
    }

    if (tsParent && tsParent.kind === 'enum') {
      return dom.create.enumValue(def.name, def.value);
    }

    if (def.kind === 'literal') {
      let { value } = def;
      if (typeof value === 'string') {
        value = value.replace(/'/g, '');
      }
      return dom.type.stringLiteral(value);
    }

    // ====== types ===========
    if (def.type === 'function') {
      return dom.create.functionType([], def.returns ? g.getType(def.returns) : dom.type.void);
    }

    if (def.type === 'object' && def.generics && ['string', 'number'].includes(def.generics[0])) {
      t = dom.create.objectType([]);
      const gen = dom.create.indexSignature('index', g.getType(def.generics[0]), g.getType(def.generics[1]));
      t.members.push(gen);
      return t;
    }

    if (primitives.includes(def.type) && dom.type[def.type]) {
      return dom.type[def.type];
    }

    if (def.type) {
      return dom.create.namedTypeReference(def.type);
    }

    // console.warn('ANY', def);
    return dom.type.any;
  };

  return (def, tsParent) => {
    const t = getBase(def, tsParent);

    if (def.generics && t.typeArguments) {
      def.generics.forEach(gen => {
        t.typeArguments.push(g.getType(gen));
      });
    }

    if (def.templates && t.typeParameters) {
      t.typeParameters = typeParams(def.templates, t, g);
    }

    const com = comments(def, t);
    if (com) {
      t.jsDocComment = com;
    }

    return t;
  };
}

module.exports = typeFn;
