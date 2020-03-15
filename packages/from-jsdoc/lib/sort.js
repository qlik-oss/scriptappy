function sortAlphabetically(a, b) {
  const aa = a.toLowerCase();
  const bb = b.toLowerCase();
  return aa > bb ? 1 : bb > aa ? -1 : 0; // eslint-disable-line
}

const sortObject = entry => {
  ['entries', 'staticEntries', 'definitions', 'events'].forEach(subentry => {
    if (!entry[subentry]) {
      return;
    }
    const sorted = {};
    Object.keys(entry[subentry])
      .map(k => `__${entry[subentry][k].optional ? 1 : 0}__${k}`)
      .sort(sortAlphabetically)
      .map(k => k.replace(/^__[01]__/, ''))
      .forEach(key => {
        sorted[key] = entry[subentry][key];
      });

    entry[subentry] = sorted; // eslint-disable-line
  });
};

module.exports = {
  sortObject,
  sortAlphabetically,
};
