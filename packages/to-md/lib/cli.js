#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, global-require: 0 */
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const extend = require('extend');

const toMd = require('./index');

const defaultConfig = {
  output: 'api.md',
};

function doIt(specFile, config) {
  const spec = require(specFile); // eslint-disable-line
  const md = toMd(spec, config);

  const generated = `

# ${spec.info.name}

> version: ${spec.info.version}

## Table of contents

${md.toc()}

## API

${md.content()}

${md.references()}
`;

  fs.ensureFileSync(config.output);
  fs.writeFileSync(config.output, generated);
}

const toMdCommand = {
  command: 'to-md',
  desc: 'Generate API reference in markdown',
  builder(y) {
    y.option('config', {
      alias: 'c',
      describe: 'Path to config file',
      type: 'string',
      default: null,
    });
    y.option('spec', {
      type: 'string',
      alias: 's',
    });
    y.option('output', {
      type: 'string',
      alias: 'o',
    });
    y.option('watch', {
      type: 'boolean',
      alias: 'w',
      default: false,
    });
  },
  handler(argv) {
    const configs = [defaultConfig];
    let specPath;

    if (typeof argv.c === 'string') {
      const p = path.resolve(process.cwd(), argv.c);
      if (!fs.existsSync(p)) {
        throw new Error(`Config ${p} not found`);
      }
      const c = require(p);
      try {
        specPath = c.fromJsdoc.output.file;
      } catch (e) {
        specPath = 'scriptappy.json';
      }
      configs.push(c.toMd);
    }
    const config = extend(true, {}, ...configs, argv);

    const specFile = path.resolve(process.cwd(), config.spec || specPath);
    doIt(specFile, config);
    if (argv.w) {
      console.log('\n\nWatching changes...');
      chokidar.watch([specFile]).on('change', () => {
        delete require.cache[specFile];
        doIt(specFile, config);

        console.log('  ...updated');
      });
    }
  },
};

module.exports = toMdCommand;
