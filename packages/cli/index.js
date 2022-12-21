#!/usr/bin/env node
/* eslint no-unused-expressions: 0 */

const importCwd = require('import-cwd');
const yargs = require('yargs');

yargs.usage('sy <command> [options]');

const tryAddCommand = (m) => {
  let c;
  try {
    c = require(`${m}/lib/cli`); // eslint-disable-line
  } catch (e) {
    c = importCwd.silent(`${m}/lib/cli`);
  }

  if (c) {
    yargs.command(c);
  } else {
    const com = m.split('/')[1];
    yargs.command({
      command: com,
      handler() {
        throw new Error(
          `Command \x1b[36m${com}\x1b[0m is missing, make sure to install \x1b[36m${m}\x1b[0m and then run again.`
        );
      },
    });
  }
};

['@scriptappy/from-jsdoc', '@scriptappy/to-md', '@scriptappy/to-dts'].forEach(tryAddCommand);

yargs.demandCommand().alias('h', 'help').wrap(Math.min(80, yargs.terminalWidth())).argv;
