#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, global-require: 0 */

const fs = require('fs');
const path = require('path');
const extend = require('extend');
const yargs = require('yargs');

const { generate, write } = require('./transformer.js');

const defaultConfig = require('../spec.config.js');

const y = yargs // eslint-disable-line no-unused-expressions
  .usage('jsdoc2spec')
  .help('help')
  .alias('h', 'help')
  // .version()
  .alias('v', 'version')
  .options({
    c: {
      alias: 'config',
      describe: 'Path to config file',
      type: 'string',
      default: null,
    },
    x: {
      describe: 'Output to stdout',
      type: 'boolean',
      default: false,
    },
    j: {
      alias: 'jsdoc',
      describe: 'Path to jsdoc-json file',
      type: 'string',
    },
    o: {
      alias: 'output.file',
      describe: 'File to write to',
      type: 'string',
    },
  })
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;

const config = ((configPath) => {
  if (configPath == null) {
    return defaultConfig;
  }
  const p = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(p)) {
    throw new Error(`Config ${p} not found`);
  }
  return extend(true, {}, defaultConfig, require(p));
})(y.config);

if (y.output && y.output.file != null) {
  config.output.file = y.output.file;
}
if (y.jsdoc != null) {
  config.jsdoc = y.jsdoc;
}

const run = (data) => {
  // console.log(typeof data);
  const spec = generate({
    data: data.docs || data,
    config,
  });
  if (y.x) {
    console.log(spec); // stream to stdout
  } else {
    write(spec, config.output.file);
  }
};

if (require.main === module) {
  // allow piping in the jsdoc data
  if (!process.stdin.isTTY) {
    const stdin = process.openStdin();
    let data = '';
    stdin.on('data', (chunk) => {
      data += chunk;
    });

    stdin.on('end', () => {
      run(JSON.parse(data));
    });
  } else {
    if (!config.jsdoc) {
      throw new Error('Missing jsdoc input');
    }
    const p = path.resolve(process.cwd(), config.jsdoc);
    if (!fs.existsSync(p)) {
      throw new Error(`jsdoc ${p} not found`);
    }
    const data = require(p);
    run(data);
  }
}
