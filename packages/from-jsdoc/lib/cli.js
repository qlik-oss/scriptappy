#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, global-require: 0 */

const fs = require('fs');
const path = require('path');
const extend = require('extend');

const withJSDoc = require('./index');

const defaultConfig = require('../spec.config.js');

const fromJsdoc = {
  command: 'from-jsdoc',
  desc: 'Generate a scriptappy specification from jsdoc',
  builder(y) {
    y.options({
      glob: {
        describe: 'Glob pattern for source files',
        type: 'array',
      },
      c: {
        alias: 'config',
        describe: 'Path to config file',
        type: 'string',
        default: null,
      },
      p: {
        alias: 'package',
        describe: 'Path to package.json',
        type: 'string',
      },
      x: {
        describe: 'Output to stdout',
        type: 'boolean',
        default: false,
      },
      o: {
        alias: 'output.file',
        describe: 'File to write to',
        type: 'string',
      },
      w: {
        alias: 'watch',
        describe: 'Watch for file changes',
        type: 'boolean',
        default: false,
      },
    });
  },
  handler(conf) {
    const configs = [defaultConfig];

    if (typeof conf.c === 'string') {
      const p = path.resolve(process.cwd(), conf.c);
      if (!fs.existsSync(p)) {
        throw new Error(`Config ${p} not found`);
      }
      const c = require(p);
      if (c.fromJsdoc) {
        configs.push(c.fromJsdoc);
      } else {
        console.warn('You are using an old config file format, considering updating to the new one.');
        configs.push(c);
      }
    }
    configs.push(conf);
    const config = extend(true, {}, ...configs);

    withJSDoc(config);
  },
};

module.exports = fromJsdoc;
