#!/usr/bin/env node
/* eslint no-unused-expressions: 0 */

const path = require('path');
const fs = require('fs');
const parse = require('./index.js');
const { getConfig } = require('./config');

const toDts = {
  command: 'to-dts',
  desc: 'Generate typescript definitions',
  builder(y) {
    y.options({
      spec: {
        describe: 'Path to spec file',
        type: 'string',
      },
      umd: {
        describe: 'Name of UMD variable',
        type: 'string',
      },
      export: {
        describe: 'Type of export',
        type: 'string',
      },
      'output.file': {
        alias: 'o',
        describe: 'File to write to',
        type: 'string',
      },
      includeDisclaimer: {
        describe: "Include disclaimer in output file that it's automatically generated",
        type: 'boolean',
      },
      config: {
        alias: 'c',
        describe: 'Path to config file',
        type: 'string',
        default: null,
      },
    });
  },
  handler(argv) {
    const config = getConfig(argv);
    if (typeof config.spec === 'string') {
      const p = path.resolve(process.cwd(), config.spec);
      if (!fs.existsSync(p)) {
        throw new Error(`Spec ${p} not found`);
      }
      const spec = fs.readFileSync(p, 'utf-8');
      const typed = parse(JSON.parse(spec), config);
      const output = config.output.file || path.resolve(process.cwd(), 'index.d.ts');
      fs.writeFileSync(output, typed, 'utf-8');
    } else {
      throw new Error('Please provide a spec file');
    }
  },
};

module.exports = toDts;
