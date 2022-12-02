module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/packages/from-jsdoc/test/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  coverageReporters: ['text-summary', 'lcov'],
  coverageDirectory: './coverage',
};
