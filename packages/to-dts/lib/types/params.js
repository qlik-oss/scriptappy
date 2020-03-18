const dom = require('dts-dom');

function params(pars = [], thisContext, g) {
  const ret = pars.map(p => {
    let flags = dom.ParameterFlags.None;
    if (p.optional) {
      flags |= dom.ParameterFlags.Optional;
    }
    if (p.variable) {
      flags |= dom.ParameterFlags.Rest;
    }
    const t = g.getType(p, { kind: 'parameter' });
    if (t.kind === 'object' && p.entries) {
      g.traverse(p.entries, { parent: t, path: '', flags: 0 });
    } else if (p.entries) {
      console.warn('unhandled entries');
    }
    const pp = dom.create.parameter(p.name || '$', t, flags);
    if (p.description) {
      pp._description = p.description;
    }
    return pp;
  });
  return thisContext ? [dom.create.parameter('this', g.getType(thisContext)), ...ret] : ret;
}

module.exports = params;
