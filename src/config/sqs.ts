const env = process.env;

export interface SqsConfig {
  region: string;
  QueueUrl: string;
  pollingWaitTimeMs: number;
}

const awsConfig: SqsConfig = {
  region: env.AWS_REGION || 'eu-central-1',
  QueueUrl: env.QUEUE_HOST || '',
  pollingWaitTimeMs: 100, // The duration (in milliseconds) to wait before repolling the queue
};

export default awsConfig;
