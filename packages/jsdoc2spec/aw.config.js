module.exports = {
  src: ['src/**/*.js'],
  glob: ['test/**/*.spec.js'],
  watchGlob: ['src/**/*.js', 'test/**/*.spec.js'],
  mocha: {
    bail: false,
  },
};
