const extend = require('extend');

const traverse = require('./traverse');
const entryFn = require('./entry');
const typesFn = require('./types');
const log = require('./log');


/**
 * @entry
 * @param {object} spec
 * @param {object} [config]
 * @param {templates} [config.templates]
 * @returns {module:to-md~md}
 */
module.exports = function toMarkdown(spec, {
  templates,
} = {}) {
  const toc = [];
  const types = typesFn(spec);

  const addToToc = (s) => {
    toc.push(s);
  };

  const templ = extend(true, {}, log.templates, templates);

  const entry = entryFn(templ);

  const content = traverse(spec, {
    parent: null,
    depth: 0,
    indent: 0,
  }, {
    traverse,
    entry,
    addToToc,
    getType: types.getType,
    assignSlug: types.assignSlug,
  });

  /**
   * @interface md
   */
  return {
    /**
     * @returns {string}
     */
    toc: () => `\n${toc.join('\n')}\n`,
    /**
     * @returns {string}
     */
    content: () => content,
    /**
     * @returns {string}
     */
    references: () => `\n${types.getReferences().map(ref => `[${ref.key}]: ${ref.link}`).join('\n')}\n`,
  };
};
