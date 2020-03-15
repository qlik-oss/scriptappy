module.exports = {
  src: ['lib/**/*.js'],
  glob: ['test/**/*.spec.js'],
  watchGlob: ['lib/**/*.js', 'test/**/*.spec.js'],
  mocha: {
    bail: false,
  },
};
