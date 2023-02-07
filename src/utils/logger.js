const createLogger = require('pino');

let instance;
const logger = (config) => {
  instance = createLogger(config);
  // eslint-disable-next-line
  return register;
};

const register = (options) => {
  if (!instance) {
    throw new Error('Did you forget to initialize the logger?');
  }
  return instance.child(options);
};

module.exports = register;
module.exports.createLogger = logger;
