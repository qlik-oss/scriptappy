#!/usr/bin/env node
/* eslint no-unused-expressions: 0, import/no-dynamic-require: 0, global-require: 0 */

const path = require('path');
const fs = require('fs');
const extend = require('extend');
const parse = require('./index');
const defaultConfig = require('../spec.config');

const defaultFilename = 'spec.config.js';
const RX = new RegExp(`${defaultFilename.replace(/\./g, '\\.')}$`);

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
        default: undefined,
      },
      config: {
        alias: 'c',
        describe: 'Path to config file',
        type: 'string',
        default: defaultFilename,
      },
    }).config('config', (configPath) => {
      if (configPath === null) {
        return {};
      }
      if (!fs.existsSync(configPath)) {
        // do nothing if default filename doesn't exist
        if (RX.test(configPath)) {
          return {};
        }
        throw new Error(`Config ${configPath} not found`);
      }
      return require(configPath).toDts || {};
    });
  },
  handler(argv) {
    const config = extend(true, {}, defaultConfig, argv);
    if (typeof config.spec === 'string') {
      const p = path.resolve(process.cwd(), config.spec);
      if (!fs.existsSync(p)) {
        throw new Error(`Spec ${p} not found`);
      }
      const spec = fs.readFileSync(p, 'utf-8');
      const typed = parse(JSON.parse(spec), config);
      fs.writeFileSync(config.output.file, typed, 'utf-8');
    } else {
      throw new Error('Please provide a spec file');
    }
  },
};

module.exports = toDts;
