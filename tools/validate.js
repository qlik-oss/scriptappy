#!/usr/bin/env node

const Ajv = require('ajv');
const chalk = require('chalk');
const jsonpatch = require('fast-json-patch');

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});

const schemaFile = require('../schemas/schema.json');

function toJSONPointer(s) {
  return s
    .replace(/\./g, '/')
    .replace(/\[(\d+)\]/g, '/$1')
    .replace(/\['([A-z0-9:_<>-]+)'\]/g, '/$1');
}

function message(err, {
  s = '',
} = {}) {
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
  const subajv = new Ajv({ allErrors: true, verbose: true, jsonPointers: true });

  const subschema = {
    $ref: `#/definitions/kind.${kind}`,
    definitions: schema.definitions,
  };

  const subvalidate = subajv.validate(subschema, value);
  if (!subvalidate) {
    console.log('  ', jsonPointer, chalk.dim('as'), kind);
    subajv.errors.slice(0, 10).forEach(err => console.log(message(err, { path: '' })));
    return false;
  }

  return true;
}

function validateSpec(spec, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(spec);
  console.log('\n');
  if (!valid) {
    const sorted = validate.errors.map(err => ({ depth: err.dataPath.split('.').length, e: err })).sort((a, b) => b.depth - a.depth);

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
      sorted.slice(0, 1).forEach(err => console.log(message(err.e)));
      console.log(chalk.red(`\n  ${sorted.length} violation${sorted.length > 1 ? 's' : ''} found`));
    }
    return 1;
  }
  return 0;
}

module.exports = (spec) => validateSpec(spec, schemaFile);
