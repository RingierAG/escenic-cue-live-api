import { APIGatewayEvent, Context } from 'aws-lambda';
import { lambdaRequestTracker } from 'pino-lambda';
import Joi from 'joi';

import config from '../config';
import { Logger } from '../utils/logger';

Logger.createLogger('listener', config.log.LOG_LEVEL);
const withRequest = lambdaRequestTracker();

import { queueAdd } from '../services/sqs';
import { CueLiveEntryQueueRecord } from '../models/sqs-records';

const log = Logger.getLogger({
  service: 'handler',
});
import { respondSuccess, respondFailure } from '../utils/respond';

/**
 * HTTP Request Handler
 * @param event APIGatewayEvent
 * @param context Lambda Context
 * @returns HTTP 200 when the event has been successfully parsed and
 * inserted into the consumer queue for processing
 */
export const handler = async (event: APIGatewayEvent, context: Context) => {
  withRequest(event, context);
  context.callbackWaitsForEmptyEventLoop = false;

  const schema = Joi.object({
    eventId: Joi.number().required(),
    id: Joi.number().required(),
  }).unknown();

  const req_id = context.awsRequestId;
  try {
    const eventBody = JSON.parse(event.body || '');

    await schema.validateAsync(eventBody);

    const cueLiveEntryQueueRecord: CueLiveEntryQueueRecord = {
      req_id,
      id: eventBody.id,
      eventId: eventBody.eventId,
    };

    log.info(
      { payload: cueLiveEntryQueueRecord, headers: event.headers },
      'parsedEvent'
    );

    await queueAdd(cueLiveEntryQueueRecord);

    return await respondSuccess(cueLiveEntryQueueRecord);
  } catch (err) {
    const error = new Error('Error parsing input');
    Object.assign(error, { cause: err, payload: event, req_id });
    return await respondFailure(error);
  }
};
