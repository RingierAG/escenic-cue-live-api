const { log: logConfig } = require('../../config');
const { createLogger } = require('../utils/logger');

const log = createLogger({ name: 'lambdaProjectName', level: logConfig.level })({
  service: 'handler',
});


exports.handler = (event, context, callback) => {

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({data: "This is the Lambda Template"}),
  };
  callback(null, response);
}
// Code here ...
