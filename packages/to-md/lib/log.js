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


const SEP_RX = /[.!?]$/;
const SPACE_RX = /\s+$/;
const DEFAULT_RX = /default/i;

/** @typedef {object} */
const templates = {
  /** @typedef {object} */
  default: {
    /** */
    pre: '###',
    /** */
    indent: '  ',
    slugify,
    type,
    /** */
    listItem(entry, cfg, helpers) {
      const prefix = entry.variable ? '...' : '';
      const value = !DEFAULT_RX.test(entry.description) && entry.defaultValue ? ` Defaults to \`${entry.defaultValue}\`` : '';
      const descr = `${entry.description ? ` ${entry.description.replace(SPACE_RX, '')}` : ''}`;
      const separator = value && descr && !SEP_RX.test(descr) ? '.' : '';
      const t = entry.name ? `\`${prefix}${entry.name}\` ` : '';
      return `${this.indent.repeat(cfg.indent)}- ${t}${this.type(entry, cfg, helpers)}${descr}${separator}${value}`;
    },
    /** */
    label(entry, cfg) {
      const isStatic = (entry.path || '').split('/').slice(-2)[0] === 'staticEntries';
      const isDefinition = (entry.path || '').split('/').slice(-2)[0] === 'definitions';
      if (isDefinition) {
        return `${entry.kind}: ${entry.name}`;
      }
      if (cfg.parent) {
        let prefix = cfg.parent.name;
        if (!isStatic && ['interface', 'class'].indexOf(cfg.parent.kind) !== -1) {
          prefix = (cfg.parent.name[0].toLowerCase() + cfg.parent.name.substring(1));
        }
        if (prefix) {
          return `${prefix}.${entry.name}`;
        }
      }

      if (!entry.kind) {
        return entry.name;
      }

      return `${entry.kind}: ${entry.name}`;
    },
    /** */
    toc(label, cfg) {
      return `${this.indent.repeat(cfg.depth)}- [${label}](${this.slugify(label)})`;
    },
    /** */
    header(label, cfg) {
      return `${this.pre}${'#'.repeat(cfg.depth)} ${label}`;
    },
    /** */
    meta(entry) {
      const s = [];
      if (entry.stability) {
        s.push(`> Stability: \`${entry.stability}\``);
      }
      if (entry.availability) {
        if (entry.availability.since) {
          s.push(`> Since: \`${entry.availability.since}\``);
        }
        if (entry.availability.deprecated === true) {
          s.push('> Deprecated');
        } else if (entry.availability.deprecated) {
          s.push(`> Deprecated: ${entry.availability.deprecated.description || `since ${entry.availability.deprecated.since}`}`);
        }
      }

      return s.filter(Boolean).join('\n>\n');
    },
    /** */
    description(entry, cfg, helpers) {
      let s = '';
      if (entry.extends) {
        const types = entry.extends.map(t => this.type(t, cfg, helpers)).join(', ');
        s += `${this.indent.repeat(cfg.indent + 1)}- extends: ${types}\n\n`;
      }
      return `${s}${entry.description || ''}`;
    },
    /** */
    paramSignature: (entry) => {
      let s = '';
      let optional = '';
      (entry.params || []).forEach((p, i, arr) => {
        optional += p.optional ? ']' : '';
        let postfix = '';
        if (arr[i + 1]) {
          if (arr[i + 1].optional) {
            postfix = '[, ';
          } else if (optional && !arr[i + 1].optional) {
            postfix = `${optional}, `;
            optional = '';
          } else {
            postfix = ', ';
          }
        } else if (i >= arr.length - 1) {
          postfix = optional;
        }
        const prefix = !i && p.optional ? '[' : '';
        s += `${prefix}${p.variable ? '...' : ''}${p.name}${postfix}`;

        if (!p.optional) {
          optional = '';
        }
      });
      return s;
    },
    /** */
    paramDetails(entry, cfg, helpers) {
      const sig = [];
      entry.params.forEach((p) => {
        sig.push(helpers.entry(p, { ...cfg, mode: 'list' }, helpers));
        sig.push(helpers.traverse(p, { ...cfg, mode: 'list', indent: cfg.indent + 1 }, helpers));
      });
      if (entry.returns) {
        const e = {
          name: 'returns:',
          ...entry.returns,
        };
        sig.push(helpers.entry(e, { ...cfg, mode: 'list' }, helpers));
        sig.push(helpers.traverse(e, { ...cfg, mode: 'list', indent: cfg.indent + 1 }, helpers));
      } else if (entry.async) {
        const e = {
          name: 'returns:',
          type: 'Promise',
        };
        sig.push(helpers.entry(e, { ...cfg, mode: 'list' }, helpers));
      }
      if (entry.emits) {
        sig.push(`${this.indent.repeat(cfg.indent)}- \`emits:\`\n`);
        entry.emits.forEach(t => {
          sig.push(this.listItem({ name: '', ...t }, { ...cfg, indent: cfg.indent + 1 }, helpers));
          sig.push('\n');
        });
      }
      if (entry.throws) {
        sig.push(`${this.indent.repeat(cfg.indent)}- \`throws:\`\n`);
        entry.throws.forEach(t => {
          sig.push(this.listItem({ name: '', ...t }, { ...cfg, indent: cfg.indent + 1 }, helpers));
          sig.push('\n');
        });
      }
      const s = sig.filter(Boolean).join('');
      return s;
    },
    /** */
    example(x) {
      const title = /<caption>(.+)<\/caption>/.exec(x);
      const code = title ? x.replace(title[0], '') : x;
      const codified = /```/.exec(code);

      return [
        title ? `**${title[1]}**` : '',
        codified ? `${code}` : `\`\`\`js\n${code}\n\`\`\``,
      ].filter(Boolean).join('\n\n');
    },
    /** */
    examples(entry /* , cfg, helpers */) {
      if (!entry.examples) {
        return '';
      }

      return entry.examples.map(x => this.example(x)).filter(Boolean).join('\n\n');
    },
  },
  constructor: {
    label: (entry) => `new ${entry.name}`,
  },
  /** */
  event: {
    /** */
    label(entry) {
      return `event: '${entry.name}'`;
    },
    /** */
    paramSignature: () => null,
  },
  method: {
    label(entry, cfg) {
      const isStatic = (entry.path || '').split('/').slice(-2)[0] === 'staticEntries';
      const prefix = isStatic ? cfg.parent.name : (cfg.parent.name[0].toLowerCase() + cfg.parent.name.substring(1));
      return `${prefix}.${entry.name}`;
    },
  },
};

module.exports = {
  templates,
};
