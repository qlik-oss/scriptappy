#!/usr/bin/env node

const Ajv = require('ajv');
const schema6 = require('ajv/lib/refs/json-schema-draft-06.json');
const chalk = require('chalk');
const jsonpatch = require('fast-json-patch');

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});
ajv.addMetaSchema(schema6);

function toJSONPointer(path) {
  let s = '';
  let inside = false;

  path.split('').forEach((char) => {
    if (char === '.' && !inside) {
      s += '/';
      return;
    }
    if (char === '[') {
      inside = true;
    }
    if (char === ']') {
      inside = false;
    }
    s += char;
  });

  return s.replace(/\[(\d+)\]/g, '/$1').replace(/\['([#A-z0-9:_<>.-]+)'\]/g, '/$1');
}

function message(err, { s = '' } = {}) {
  switch (err.keyword) {
    case 'additionalProperties':
      return chalk.red(`    ${s}${err.dataPath} ${err.message}: '${err.params.additionalProperty}'`);
    // case 'required':
    // case 'pattern':
    //   return chalk.red(`    ${path}${err.dataPath} ${err.message}`);
    case 'enum':
      return chalk.red(`    ${s}${err.dataPath} ${err.message}: ${err.params.allowedValues}`);
    default:
      return chalk.red(`    ${s}${err.dataPath} ${err.message}`);
  }
}

function subValidateKind(spec, schema, jsonPointer) {
  const value = jsonpatch.getValueByPointer(spec, jsonPointer);
  const kind = value.kind || 'object';
  const subajv = new Ajv({ allErrors: true, verbose: true, jsonPointers: true, strict: false });
  subajv.addMetaSchema(schema6);

  const subschema = {
    $ref: `#/definitions/kind.${kind}`,
    definitions: schema.definitions,
  };

  const subvalidate = subajv.validate(subschema, value);
  if (!subvalidate) {
    console.log('  ', jsonPointer, chalk.dim('as'), kind);
    subajv.errors.slice(0, 10).forEach((err) => console.log(message(err, { path: '' })));
    return false;
  }

  return true;
}

const obj = {};

function traverse(spec) {
  ['entries', 'definitions'].forEach((sub) =>
    Object.keys(spec[sub] || {}).forEach((key) => {
      const d = spec[sub][key];
      if (d.kind === 'class' && !obj.hasOwnProperty.call(d, 'constructor')) {
        d.constructor = { kind: 'function', params: [] };
      }
      if (d.entries || d.definitions) {
        traverse(d);
      }
    })
  );
}

function validateSpec(ss, schema) {
  // classes that don't have an own 'constructor' property will receive the constructor
  // value from the prototype chain, which will cause validation to fail.
  // to remedy this issue, we need to traverse spec and inject a dummy constructor for classes that don't have them
  const spec = JSON.parse(JSON.stringify(ss));
  traverse(spec);

  const validate = ajv.compile(schema);
  const valid = validate(spec);
  console.log('\n');
  if (!valid) {
    const sorted = validate.errors
      .map((err) => ({ depth: err.dataPath.split('.').length, e: err }))
      .sort((a, b) => b.depth - a.depth);

    // subschema validation
    const top = sorted[0];
    const s = top.e.dataPath;

    let isSubValid = true;

    if (top.e.data.kind) {
      const jsonPointer = toJSONPointer(s);
      isSubValid = subValidateKind(spec, schema, jsonPointer);
    } else if (/\.kind$/.test(s)) {
      const jsonPointer = toJSONPointer(s.replace(/\.kind$/, ''));
      isSubValid = subValidateKind(spec, schema, jsonPointer);
    }

    if (isSubValid) {
      sorted.slice(0, 1).forEach((err) => console.log(message(err.e)));
      console.log(chalk.red(`\n  ${sorted.length} violation${sorted.length > 1 ? 's' : ''} found`));
    }
    return 1;
  }
  return 0;
}

module.exports = (schema, spec) => validateSpec(spec, schema);
