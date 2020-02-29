#!/usr/bin/env node

/* eslint no-unused-expressions: 0 */
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const toMd = require('./index');

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
  },
  handler(argv) {
    const spec = require(path.resolve(process.cwd(), argv.spec)); // eslint-disable-line
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
    fs.writeFileSync(argv.output, output);
  },
};

yargs
  .usage('sy <command> [options]')
  .command(toMdCommand)
  .demandCommand()
  .alias('h', 'help')
  .wrap(Math.min(80, yargs.terminalWidth())).argv;
