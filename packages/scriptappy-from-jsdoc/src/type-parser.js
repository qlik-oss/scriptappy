const catharsis = require('catharsis');

function modifiers(cath) {
  const mods = {};
  if (cath.optional) {
    mods.optional = true;
  }
  if (typeof cath.nullable !== 'undefined') {
    mods.nullable = cath.nullable;
  }
  if (cath.repeatable) {
    mods.variable = true;
  }

  return mods;
}

function mapFields(arr) {
  const obj = {};
  arr.forEach(t => {
    const mods = modifiers(t.key);
    obj[t.key.name] = t.value ? { ...mods, ...deconstruct(t.value) } : { ...mods, type: 'any' };
  });

  return obj;
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

function deconstruct(cath) {
  const mods = modifiers(cath);
  if (cath.type === catharsis.Types.FunctionType) {
    return { ...mods, ...fn(cath) };
  }
  if (cath.type === catharsis.Types.TypeUnion) {
    return { ...mods, kind: 'union', items: cath.elements.map(t => deconstruct(t)) };
  }
  if (cath.type === catharsis.Types.RecordType) {
    return { ...mods, kind: 'object', entries: mapFields(cath.fields) };
  }
  if (cath.type === catharsis.Types.TypeApplication) {
    if (cath.expression.name === 'Array') {
      const items = cath.applications.map(t => deconstruct(t));
      // TODO - find a better way to differentiate between same item in array and tuples
      return { ...mods, kind: 'array', items: items.length === 1 ? { ...items[0] } : items };
    }
    if (cath.expression.name === 'Object') {
      return { ...mods, kind: 'object', entries: {}, generics: cath.applications.map(t => deconstruct(t)) };
    }
    return {
      type: cath.expression.name,
      generics: cath.applications.map(t => deconstruct(t)),
    };
  }
  if (cath.type === catharsis.Types.NameExpression) {
    const lit = literal(cath.name);
    if (lit) {
      return { ...mods, kind: 'literal', value: lit === 'number' ? +cath.name : cath.name };
    }
    return { ...mods, type: cath.name };
  }
  if (cath.type === catharsis.Types.UndefinedLiteral) {
    return { ...mods, type: 'undefined' };
  }
  return undefined;
}

function fn(type) {
  const r = {
    kind: 'function',
    params: type.params.map(p => deconstruct(p)),
  };
  if (type.result) {
    r.returns = deconstruct(type.result);
  }

  return r;
}

const getTypeExpression = text => {
  const start = text.indexOf('{');
  if (start < 0) {
    return '';
  }
  let c = 1;
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '{') c++;
    if (text[i] === '}') c--;

    if (!c) {
      return text.substring(start + 1, i);
    }
  }
  return '';
};

const getParamFromComment = (name, c) => {
  const rx = new RegExp(`^\\s*\\*\\s*@param\\s+(.*)\\s*${name}`);
  const rows = c.split('\n');
  for (let i = 0; i < rows.length; i++) {
    const m = rx.exec(rows[i]);
    if (m) {
      return getTypeExpression(m[1]);
    }
  }
  return undefined;
};

const getTypedefFromComment = c => {
  const rx = new RegExp(`^\\s*\\*\\s*@typedef\\s+(.*)\\s*`);
  const rows = c.split('\n');
  for (let i = 0; i < rows.length; i++) {
    const m = rx.exec(rows[i]);
    if (m) {
      return getTypeExpression(m[1]);
    }
  }
  return undefined;
};

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

const parse = exp => {
  if (exp === 'function') {
    return {
      type: 'function',
    };
  }
  const t = catharsis.parse(exp, { jsdoc: true });

  return deconstruct(t);
};

module.exports = {
  getTypeFromCodeMeta,
  getTypeExpression,
  getParamFromComment,
  getTypedefFromComment,
  parse,
};
