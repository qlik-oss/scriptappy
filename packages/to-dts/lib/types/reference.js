const dom = require('dts-dom');

const DEF_RX = /^#\/definitions\//;
module.exports = function ref(path, tsParent, g) {
  const p = path
    .split('/')
    .slice(1)
    .filter((a, i) => i % 2 !== 0)
    .join('.');

  if (g.namespace && DEF_RX.test(path)) {
    return dom.create.namedTypeReference(`${g.namespace}.${p}`);
  }

  return dom.create.namedTypeReference(p);
};
