exports.defineTags = (dictionary) => {
  dictionary.defineTag('template', {
    canHaveType: true,
    canHaveName: true,
    onTagged(doclet, tag) {
      doclet.tags = doclet.tags || []; // eslint-disable-line
      doclet.tags.push(tag);
    },
  });
};
