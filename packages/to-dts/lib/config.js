/* eslint import/no-dynamic-require: 0, global-require: 0 */

const path = require('path');
const fs = require('fs');
const extend = require('extend');
const defaultConfig = require('../spec.config');

function getConfig(argv) {
  const configs = [defaultConfig];
  if (typeof argv.c === 'string') {
    const p = path.resolve(process.cwd(), argv.c);
    if (!fs.existsSync(p)) {
      throw new Error(`Config ${p} not found`);
    }
    const c = require(p);
    if (c.toDts) {
      configs.push(c.toDts);
    } else {
      console.warn('Config file has no "toDts" settings');
    }
  }
  configs.push(argv);

  return extend(true, {}, ...configs);
}

module.exports = { getConfig };
