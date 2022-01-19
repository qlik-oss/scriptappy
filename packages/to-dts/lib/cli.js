#!/usr/bin/env node
/* eslint no-unused-expressions: 0 */

const path = require('path');
const fs = require('fs');
const parse = require('./index');

const toDts = {
  command: 'to-dts',
  desc: 'Generate typescript definitions',
  builder(y) {
    y.options({
      spec: {
        describe: 'Path to spec file',
        type: 'string',
        default: 'scriptappy.json',
      },
      umd: {
        describe: 'Name of UMD variable',
        type: 'string',
      },
      export: {
        describe: 'Type of export',
        type: 'string',
      },
      exportConst: {
        description: 'Create const of generated type to export',
        type: 'string',
      },
      output: {
        alias: 'o',
        describe: 'File to write to',
        type: 'string',
      },
    });
  },
  handler(argv) {
    if (typeof argv.spec === 'string') {
      const p = path.resolve(process.cwd(), argv.spec);
      if (!fs.existsSync(p)) {
        throw new Error(`Spec ${p} not found`);
      }
      const spec = fs.readFileSync(p, 'utf-8');
      const typed = parse(JSON.parse(spec), argv);
      const output = argv.output || path.resolve(process.cwd(), 'index.d.ts');
      fs.writeFileSync(output, typed, 'utf-8');
    } else {
      throw new Error('Please provide a spec file');
    }
  },
};

module.exports = toDts;
