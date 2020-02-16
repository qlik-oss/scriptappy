const types = require('./types');

const BASIC_TYPES = [
  'boolean',
  'number',
  'string',
  'function',
  'object',
  'array',
  'any',
  'null',
  'symbol',
  'undefined',
].concat(types);

const GLOB = global;

function checkTypes(obj, priv, cfg) {
  let prop;
  Object.keys(obj).forEach(key => {
    prop = obj[key];
    if (prop == null || typeof prop !== 'object') {
      return;
    }
    if (typeof prop.type === 'string') {
      const generic = prop.type.match(/<.*>/); // find generic
      const t = prop.type.replace(/<.*>/, ''); // strip generic
      if (priv[prop.type] && priv[prop.type][0].__ref) {
        prop.type = priv[prop.type][0].__ref;
      } else if (cfg.parse.types[t]) {
        if (cfg.parse.types[t].rewrite) {
          prop.type = `${cfg.parse.types[t].rewrite}${generic ? generic[0] : ''}`;
        }
      } else if (BASIC_TYPES.indexOf(t) === -1 && typeof GLOB[t] === 'undefined') {
        cfg.logRule(null, 'no-unknown-types', `Type unknown: '${prop.type}'`);
      }
    }

    checkTypes(prop, priv, cfg);
  });
}

module.exports = checkTypes;
