const slugify = (s) => `#${s.replace(/[^A-Z0-9\s-]/gi, '').replace(/\s+/g, '-').toLowerCase()}`;

const type = (entry, cfg, helpers) => {
  let subType = '';

  // TODO - nest even more
  if (entry.kind === 'union' && entry.items) {
    subType = entry.items.map(u => `${helpers.getType(u)}`).join('|');
    return `<${subType}>`;
  }

  if (entry.kind === 'array' && entry.items && !entry.items[0]) {
    subType = `<${helpers.getType(entry.items)}>`;
  }

  if (entry.generics) {
    subType = `<${entry.generics.map(u => `${helpers.getType(u)}`).join(',')}>`;
  }

  // if (entry.kind === 'array' && Array.isArray(entry.items)) { // tuple
  //   // TODO
  // }

  return `<${helpers.getType(entry)}${subType}>`;
};

const templates = {
  default: {
    pre: '###',
    indent: '  ',
    slugify,
    type,
    listItem(entry, cfg, helpers) {
      return `${this.indent.repeat(cfg.indent)}- \`${entry.name}\` ${this.type(entry, cfg, helpers)}${entry.description ? ` ${entry.description}` : ''}`;
    },
    label: (entry) => `${entry.kind}: ${entry.name}`,
    toc(label, cfg) {
      return `${this.indent.repeat(cfg.depth)}- [${label}](${this.slugify(label)})`;
    },
    header(label, cfg) {
      return `${this.pre}${'#'.repeat(cfg.depth)} ${label}`;
    },
    description: (entry) => entry.description,
    paramSignature: (entry) => (entry.params || []).map(p => p.name).join(', '),
    paramDetails: (entry, cfg, helpers) => {
      const sig = [];
      entry.params.forEach((p) => {
        sig.push(helpers.entry(p, { ...cfg, mode: 'list' }, helpers));
        sig.push(helpers.traverse(p, { ...cfg, mode: 'list', indent: cfg.indent + 1 }, helpers));
      });
      // TODO - return
      const s = sig.filter(Boolean).join('');
      return s;
    },
  },
  constructor: {
    label: (entry) => `new ${entry.name}`,
  },
  method: {
    label: (entry, cfg) => `${cfg.parent.name[0].toLowerCase() + cfg.parent.name.substring(1)}.${entry.name}`,
  },
};

module.exports = {
  templates,
};
