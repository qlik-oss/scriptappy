module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/packages/*/test/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
