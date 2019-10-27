function entryClosure(templates) {
  function entryFn(entry, cfg, helpers) {
    const { parent } = cfg;
    const kind = parent && parent.kind === 'class' && entry.kind === 'function' && templates.method ? 'method' : entry.kind;
    const templ = {
      ...templates.default,
      ...(templates.hasOwnProperty(kind) ? templates[kind] : {}), // eslint-disable-line no-prototype-builtins
    };

    const fnArgs = [entry, cfg, helpers];

    if (cfg.mode === 'list') {
      return `${templ.listItem(...fnArgs)}\n`;
    }

    const label = templ.label(...fnArgs);
    const description = templ.description(...fnArgs);
    const meta = templ.meta(...fnArgs);
    let paramDetails = '';
    let paramSignature = '';

    let fullLabel = label;

    if (entry.params) {
      paramSignature = templ.paramSignature(...fnArgs);
      paramDetails = templ.paramDetails(...fnArgs);
      if (paramSignature !== null) {
        fullLabel = `${label}${`(${paramSignature || ''})`}`;
      } else {
        fullLabel = `${label}`;
      }
    }
    const header = templ.header(fullLabel, cfg);

    const tocLabel = templ.toc(fullLabel, cfg);
    const slug = templ.slugify(fullLabel);
    if (tocLabel) {
      helpers.addToToc(tocLabel);
    }
    helpers.assignSlug(entry, slug);

    const examples = templ.examples(...fnArgs);

    const section = [
      header,
      meta,
      paramDetails,
      description,
      examples,
    ].filter(Boolean).join('\n\n');

    if (section.length) {
      return `\n\n${section}\n\n`;
    }
    return '';
  }

  return entryFn;
}

module.exports = entryClosure;
