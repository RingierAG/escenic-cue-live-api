'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.respondSuccess = exports.respondFailure = void 0;
const logger_1 = require('./logger');
const log = logger_1.Logger.getLogger({
  service: 'respond',
});
const respondFailure = async (error, code) => {
  const statusCode = code || 500;
  const errors = ['Internal server error'];
  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      statusCode: statusCode,
      errors,
    }),
  };
  log.error(error);
  return Promise.resolve(response);
};
exports.respondFailure = respondFailure;
const respondSuccess = (data) => {
  if (data) {
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    return Promise.resolve(response);
  } else {
    const error = new Error('Missing data');
    return (0, exports.respondFailure)(error);
  }
};
exports.respondSuccess = respondSuccess;
//# sourceMappingURL=respond.js.map
