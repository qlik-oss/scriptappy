#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, global-require: 0 */

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const validate = require('./validate');

const args = yargs
  .usage('$0 -s <file>')
  .version(false)
  .options({
    s: {
      alias: 'spec',
      describe: 'Path to spec file',
      type: 'string',
      demandOption: true,
      requiresArg: true,
    },
  })
  .wrap(Math.min(120, yargs.terminalWidth()))
  .help('help')
  .alias('h', 'help')
  .argv;

const p = path.resolve(process.cwd(), args.s);
if (!fs.existsSync(p)) {
  throw new Error(`Spec ${p} not found`);
}

validate(require(p));
