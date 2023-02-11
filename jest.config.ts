import { JestConfigWithTsJest } from 'ts-jest';
import { defaults as tsjPreset } from 'ts-jest/presets';

const config: JestConfigWithTsJest = {
  testMatch: ['**/__tests__/**/*.test.ts'],
  testEnvironment: 'node',
  snapshotFormat: {
    printBasicPrototype: false,
  },
  moduleDirectories: ['node_modules'],
  transform: {
    ...tsjPreset.transform,
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
};

export default config;
