#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const toMd = require('./index');

function doIt(specFile, destination) {
  const spec = require(specFile); // eslint-disable-line
  const md = toMd(spec);
  const output = `

# ${spec.info.name}

> version: ${spec.info.version}

## Table of contents

${md.toc()}

## API

${md.content()}

${md.references()}
`;
  fs.writeFileSync(destination, output);
}

const toMdCommand = {
  command: 'to-md',
  desc: 'Generate API reference in markdown',
  builder(y) {
    y.option('spec', {
      type: 'string',
      alias: 's',
      required: true,
    });
    y.option('output', {
      type: 'string',
      alias: 'o',
      default: 'api.md',
    });
    y.option('watch', {
      type: 'boolean',
      alias: 'w',
      default: false,
    });
  },
  handler(argv) {
    const specFile = path.resolve(process.cwd(), argv.spec);
    doIt(specFile, argv.output);
    if (argv.w) {
      console.log('\n\nWatching changes...');
      chokidar.watch([specFile]).on('change', () => {
        delete require.cache[specFile];
        doIt(specFile, argv.output);

        console.log('  ...updated');
      });
    }
  },
};

module.exports = toMdCommand;
