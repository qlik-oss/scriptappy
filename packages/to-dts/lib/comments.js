module.exports = function c(def, t) {
  const comments = [];

  if (def.description) {
    comments.push(def.description);
  }
  if (def.availability && def.availability.deprecated) {
    // TODO - add @version if @since is present
    comments.push('@deprecated');
  }
  if (t.parameters && t.parameters.length) {
    comments.push(
      ...t.parameters
        .filter(p => p.name !== 'this')
        .map(p => `@param ${p.name}${p.description ? ` ${p.description}` : ''}`)
    );
  }

  return comments.length ? comments.join('\n') : undefined;
};
