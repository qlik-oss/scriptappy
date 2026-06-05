module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/packages/*/test/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/packages/from-jsdoc/lib/collector\\.js$'],
};
