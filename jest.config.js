module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: [],
  testResultsProcessor: '<rootDir>/node_modules/jest-teamcity-reporter',
};
