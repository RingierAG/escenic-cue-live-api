process.env.STAGE = 'stg';

const { log: logConfig } = require('./config');
const { createLogger } = require('./src/utils/logger');

createLogger(logConfig)({
  service: 'jest-app',
});
