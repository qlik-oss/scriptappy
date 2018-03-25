#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const schema = require('../schema.json');

const partial = fs.readFileSync(path.resolve(__dirname, 'partial.md'), {
  encoding: 'utf8',
});

let s = '';

const references = [];

function referenceName(id) {
  if (/^kind\./.test(id)) {
    let n = id.replace('kind.', '');
    n = n.substr(0, 1).toUpperCase() + n.substr(1);
    return `${n}`;
  } else if (/^entity-tier/.test(id)) {
    const num = +/entity-tier(\d)/.exec(id)[1];
    return `Entity Tier ${num}`;
  } else if (id === 'type') {
    return 'Entity Base';
  }

  return `${id.substr(0, 1).toUpperCase() + id.substr(1)} Object`;

  // return id;
}

function reference(r) {
  const id = r.replace('#/definitions/', '');
  const name = referenceName(id);
  return `[${name}](#${id})`;
}

function type(obj) {
  let t = '';

  if (obj.$ref) {
    const def = schema.definitions[obj.$ref.replace('#/definitions/', '')];
    if (def && def.type === 'string') {
      const enu = def.enum ? def.enum.map(_ => `\`'${_}'\``).join(' \\| ') : '';
      t = enu || '`string`';
    } else {
      t = reference(obj.$ref);
    }
  } else if (obj.const) {
    t = `\`const\` \`'${obj.const}'\``;
  } else if (typeof obj.additionalProperties === 'object') {
    t = 'Object';
    let refs = [obj.additionalProperties.$ref];
    if (obj.additionalProperties.oneOf) {
      refs = obj.additionalProperties.oneOf.map(r => r.$ref);
    }
    const ref = refs.map(reference).join(' \\| ');
    t = `Object&lt;\`string\`, ${ref}&gt;`;
  } else if (obj.type === 'array') {
    t = type(obj.items);
    t = `Array&lt;${t}&gt;`;
  } else if (Array.isArray(obj.oneOf)) {
    t = obj.oneOf.map(type).join(' \\| ');
  } else if (Array.isArray(obj.allOf)) {
    t = obj.allOf.map(type).join(' & ');
  } else if (obj.type) {
    switch (obj.type) {
      case 'boolean':
      case 'string':
      case 'number':
        t = `\`${obj.type}\``;
        break;
      default:
        throw new Error('Unhandled type');
    }
  }

  return t;
}

function entityTier(entity, k) {
  s += `#### <a name="${k}"></a> ${referenceName(k)}\n`;

  references.push(reference(k));

  s += 'This tier is a collection of other entities, wherever this tier is referenced, the following entities are allowed:\n';

  s += '\n';
  s += entity.oneOf.map(type).join(' | ');
  s += '\n\n';
}

function table(props, required = []) {
  const fields = Object.keys(props).filter(key => props[key] !== true);
  let ss = '';
  if (fields.length) {
    ss += '\nField|Type|Description\n';
    ss += '---|---|---\n';
    fields.forEach(f => {
      const t = type(props[f]);
      ss += `${f}|${t}|${required.indexOf(f) !== -1 ? '**REQUIRED.** ' : ''}${props[f].description || ''}\n`;
    });
  }
  return ss;
}

function examples(ent) {
  let ss = '';
  if (ent.examples) {
    ss += '\n##### Example\n\n';
    ss += ent.examples.map(x => `\`\`\`js\n{${x}}\n\`\`\`\n`).join('\n');
  }

  return ss;
}

function kind(entity, k) {
  s += `#### <a name="${k}"></a> ${referenceName(k)}\n`;

  references.push(reference(k));

  s += `\n> This entity extends from ${reference('type')} and accepts all its fields as well.\n`;

  const props = entity.allOf[1].properties;
  s += table(props, entity.allOf[1].required);

  s += examples(entity);

  s += '\n';
}

function definition(def, id) {
  s += `#### <a name="${id}"></a> ${referenceName(id)}\n`;

  references.push(reference(id));

  const props = def.properties;
  s += table(props, def.required);

  s += examples(def);

  s += '\n';
}

definition(schema.definitions.common, 'type');
definition(schema.definitions.availability, 'availability');
definition(schema.definitions.deprecated, 'deprecated');

Object.keys(schema.definitions).filter(key => /^entity-tier/.test(key)).forEach(key => {
  entityTier(schema.definitions[key], key);
});

Object.keys(schema.definitions).filter(key => /^kind\./.test(key) || key === 'constructor').forEach(key => {
  kind(schema.definitions[key], key);
});

const TOC = references.map(r => `    - ${r}`).join('\n');

let generated = partial.replace('{{SCHEMA_TOC}}', TOC);
generated = generated.replace('{{GENERATED}}', s);
generated = generated.replace(/\{\{SCHEMA_VERSION\}\}/g, pkg.version);
fs.writeFileSync(path.resolve(__dirname, '../specification.md'), generated);
