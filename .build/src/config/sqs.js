'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const env = process.env;
const awsConfig = {
  region: env.AWS_REGION || 'eu-central-1',
  QueueUrl: env.QUEUE_HOST || '',
  pollingWaitTimeMs: 100, // The duration (in milliseconds) to wait before repolling the queue
};
exports.default = awsConfig;
//# sourceMappingURL=sqs.js.map
