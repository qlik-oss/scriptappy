const dom = require('dts-dom');

module.exports = function ref(path, tsParent, g) {
  const p = path
    .split('/')
    .slice(1)
    .filter((a, i) => i % 2 !== 0)
    .join('.');

  if (g.namespace) {
    return dom.create.namedTypeReference(`${g.namespace}.${p}`);
  }

  return dom.create.namedTypeReference(p);
};
