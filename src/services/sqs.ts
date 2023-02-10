import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import { CueLiveEntryQueueRecord } from '../models/';

import config from '../config';

const sqsClient = new SQSClient({ region: config.sqs.region });

export const queueAdd = async (message: CueLiveEntryQueueRecord) => {
  try {
    const params: SendMessageCommandInput = {
      MessageBody: JSON.stringify(message),
      QueueUrl: config.sqs.QueueUrl,

      // Adding this in order to correlate Lambda executions
      // the value will be used to set the x-correlation-id of the
      // lambda that will be triggered by this SQS message
      MessageAttributes: {
        'x-correlation-id': {
          DataType: 'String',
          StringValue: message.req_id,
        },
      },
    };

    await sqsClient.send(new SendMessageCommand(params));

    return message;
  } catch (err) {
    const error = new Error('Queue error adding message');
    Object.assign(error, { cause: err, message });
    throw err;
  }
};
