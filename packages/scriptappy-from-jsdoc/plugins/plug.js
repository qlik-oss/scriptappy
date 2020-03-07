const catharsis = require('catharsis');

const getTypeExpression = text => {
  const start = text.indexOf('{');
  if (start < 0) {
    return '';
  }
  let c = 1;
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '{') c++;
    if (text[i] === '}') c--;

    if (!c) {
      return text.substring(start + 1, i);
    }
  }
  return '';
};

exports.defineTags = dictionary => {
  dictionary.defineTag('template', {
    canHaveType: true,
    canHaveName: true,
    onTagged(doclet, tag) {
      doclet.tags = doclet.tags || []; // eslint-disable-line
      doclet.tags.push(tag);
    },
  });

  dictionary.defineTag('_param', {
    // canHaveType: true,
    // canHaveName: true,
    // mustHaveValue: true,
    onTagged(doclet, tag) {
      // doclet.syparams = doclet.syparams || []; // eslint-disable-line
      // doclet.syparams.push(tag);
      // console.error(doclet);
      // console.error(tag);
      console.error('foo', tag);
      doclet.ccParams = doclet.ccParams || [];
      try {
        const exp = getTypeExpression(tag.text);
        doclet.ccParams.push(exp);
      } catch (e) {}
      // doclet.par = tag;
    },
  });
};

// exports.handlers = {
//   jsdocCommentFound(e) {
//     // console.error(e.comment);
//     // e.comment = '/** foo */';
//   },
// };
