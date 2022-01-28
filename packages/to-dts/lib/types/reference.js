const dom = require('dts-dom');

const DEF_RX = /^#\/definitions\//;
module.exports = function ref(path, name, g, isEntry) {
  const p = path
    .split('/')
    .slice(1)
    .filter((a, i) => i % 2 !== 0)
    .join('.');

  // API entry
  if (isEntry) {
    return dom.create.const(name, [g.namespace, p].filter(Boolean).join('.'));
  }
  // Definition ref
  if (DEF_RX.test(path)) {
    return dom.create.namedTypeReference([g.namespace, p].filter(Boolean).join('.'));
  }
  // Entry ref
  const typeRef = dom.create.namedTypeReference(p);
  return dom.create.typeof(typeRef);
};
