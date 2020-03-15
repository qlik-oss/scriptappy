#!/usr/bin/env node
/* eslint no-unused-expressions: 0 */

const importCwd = require('import-cwd');
const yargs = require('yargs');

yargs.usage('sy <command> [options]');

const tryAddCommand = m => {
  const c = importCwd.silent(`${m}/lib/cli`);

  if (c) {
    yargs.command(c);
  }
};

['@scriptappy/from-jsdoc', '@scriptappy/to-md', '@scriptappy/to-dts'].forEach(tryAddCommand);

yargs
  .demandCommand()
  .alias('h', 'help')
  .wrap(Math.min(80, yargs.terminalWidth())).argv;
