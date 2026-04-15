const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: 'lib/index.js',
  plugins: [
    resolve({ preferBuiltins: false }),
    commonjs(),
  ],
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs', exports: 'auto' },
    { file: 'dist/index.esm.js', format: 'es' },
  ],
};
