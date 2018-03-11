#!/usr/bin/env node
/* eslint import/no-dynamic-require: 0, global-require: 0 */

const fs = require('fs');
const path = require('path');
const extend = require('extend');
const yargs = require('yargs');
const globby = require('globby');
const cp = require('child_process');

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
if (y.p != null) {
  config.package = y.p;
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
    s = cp.execSync('node ../node_modules/.bin/jsdoc -c ./temp.conf.json -p -X', { cwd: __dirname });
  } finally {
    fs.unlinkSync(temp);
  }

  if (!s) {
    throw new Error('Could not generate JSDoc');
  }

  run(JSON.parse(s));
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
  } else if (typeof config.jsdoc === 'string') { // assume path to jsdoc-json file
    const p = path.resolve(process.cwd(), config.jsdoc);
    if (!fs.existsSync(p)) {
      throw new Error(`jsdoc ${p} not found`);
    }
    run(require(p));
  } else {
    (async () => {
      const cwd = process.cwd();
      const pkg = config.package ? path.resolve(cwd, config.package) : [];
      const files = (await globby(config.glob, {
        gitignore: true,
      })).concat(pkg).map(f => path.resolve(cwd, f)); // need actual filenames since jsdoc does not support glob patterns
      try {
        runWithJSDoc(files);
      } catch (e) {
        // console.log(e.stack);
      }
    })();
  }
}
