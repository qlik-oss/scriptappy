const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const extend = require('extend');
const globby = require('globby');
const chokidar = require('chokidar');
const cp = require('child_process');

const { generate } = require('./transformer.js');

const getJsDocConfig = (files, config) => {
  const cfg = {
    source: {
      include: files,
    },
    plugins: [path.resolve(__dirname, '../plugins/plug.js')],
  };
  if (typeof config.jsdoc === 'object') {
    const plugins = (config.jsdoc.plugins || []).map(f => path.resolve(process.cwd(), f));
    extend(true, cfg, {
      plugins,
    });
  }

  return cfg;
};

const generateJSDoc = jsDocConfig => {
  let s = '';
  const jsdocConfigFilename = crypto.randomBytes(6).toString('hex');
  const temp = path.join(__dirname, `${jsdocConfigFilename}.json`);
  fs.writeFileSync(temp, JSON.stringify(jsDocConfig, null, 2));
  try {
    s = cp.execSync(`npx jsdoc -c ./${jsdocConfigFilename}.json -p -X`, { cwd: __dirname });
  } catch (e) {
    throw new Error(e.stderr.toString());
  } finally {
    fs.unlinkSync(temp);
  }

  let parsed;

  if (!s) {
    throw new Error('Could not generate JSDoc');
  } else {
    try {
      parsed = JSON.parse(s);
    } catch (e) {
      throw new Error(s);
    }
  }

  return parsed;
};

const withJSDoc = async config => {
  const cwd = process.cwd();
  const pkg = config.package ? path.resolve(cwd, config.package) : [];
  const files = (
    await globby(config.glob, {
      gitignore: false,
    })
  )
    .concat(pkg)
    .map(f => path.resolve(cwd, f)); // need actual filenames since jsdoc does not support glob patterns

  const jsDocConfig = getJsDocConfig(files, config);
  let jsdoc;
  try {
    jsdoc = generateJSDoc(jsDocConfig);
    generate({
      data: jsdoc.docs || jsdoc,
      config,
    });
  } catch (e) {
    console.error(e);
    if (!config.w) {
      process.exitCode = 1;
    }
  }
  if (config.w) {
    chokidar.watch(files).on('change', () => {
      try {
        jsdoc = generateJSDoc(jsDocConfig);
        generate({
          data: jsdoc.docs || jsdoc,
          config,
        });
      } catch (e) {
        console.error(e);
      }
    });
    console.log('\nWatching changes...');
  }
};

module.exports = withJSDoc;
