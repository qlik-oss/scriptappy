#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, global-require: 0 */

const fs = require('fs');
const path = require('path');
const extend = require('extend');
const yargs = require('yargs');
const globby = require('globby');
const chokidar = require('chokidar');
const cp = require('child_process');

const { generate } = require('./transformer.js');

const defaultConfig = require('../spec.config.js');

const conf = yargs // eslint-disable-line no-unused-expressions
  .usage('scriptappy-from-jsdoc')
  .help('help')
  .alias('h', 'help')
  .alias('v', 'version')
  .options({
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
    w: {
      alias: 'watch',
      describe: 'Watch for file changes',
      type: 'boolean',
      default: false,
    },
  })
  .wrap(Math.min(120, yargs.terminalWidth()))
  .argv;

const configs = [defaultConfig];

if (typeof conf.c === 'string') {
  const p = path.resolve(process.cwd(), conf.c);
  if (!fs.existsSync(p)) {
    throw new Error(`Config ${p} not found`);
  }
  configs.push(require(p));
}
configs.push(conf);
const config = extend(true, {}, ...configs);

const run = (data) => {
  generate({
    data: data.docs || data,
    config,
  });
};

const runWithJSDoc = (files) => {
  let s = '';
  const cfg = {
    source: {
      include: files,
    },
  };
  if (typeof config.jsdoc === 'object') {
    const plugins = (config.jsdoc.plugins || []).map(f => path.resolve(process.cwd(), f));
    extend(true, cfg, {
      plugins,
    });
  }
  const temp = path.join(__dirname, 'temp.conf.json');
  fs.writeFileSync(temp, JSON.stringify(cfg, null, 2));
  try {
    s = cp.execSync('npx jsdoc -c ./temp.conf.json -p -X', { cwd: __dirname });
  } finally {
    fs.unlinkSync(temp);
  }

  if (!s) {
    throw new Error('Could not generate JSDoc');
  }

  run(JSON.parse(s));
};

if (require.main === module) {
  if (typeof config.jsdoc === 'string') { // assume path to jsdoc-json file
    const p = path.resolve(process.cwd(), config.jsdoc);
    if (!fs.existsSync(p)) {
      throw new Error(`jsdoc ${p} not found`);
    }
    run(require(p));
  } else {
    const withJSDoc = async () => {
      const cwd = process.cwd();
      const pkg = config.package ? path.resolve(cwd, config.package) : [];
      const files = (await globby(config.glob, {
        gitignore: false,
      })).concat(pkg).map(f => path.resolve(cwd, f)); // need actual filenames since jsdoc does not support glob patterns
      if (config.w) {
        chokidar.watch(files).on('change', (filename) => {
          console.log(filename);
          runWithJSDoc(files);
        });
      }
      try {
        runWithJSDoc(files);
      } catch (e) {
        process.exitCode = 1;
        console.log(e.stack);
        throw e;
      }
    };
    (!process.stdin.isTTY ? new Promise((resolve, reject) => {
      const stdin = process.openStdin();
      let data = '';

      const timer = setTimeout(() => {
        stdin.unref();
        reject();
        stdin.end();
      }, 10);

      stdin.on('data', (chunk) => {
        clearTimeout(timer);
        data += chunk;
      });

      stdin.on('end', () => {
        resolve();
        run(JSON.parse(data));
      });
    }) : Promise.reject()).catch(() => {
      withJSDoc();
    });
  }
}
