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
import { CueLiveEntry } from 'src/models/cueLiveEntry';

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

  const schema = Joi.object<CueLiveEntry>({
    eventId: Joi.number().required(),
    id: Joi.number().required(),
    author: Joi.object(),
    creator: Joi.object(),
    createdDate: Joi.string().required(),
    publishedDate: Joi.string().required(),
    lastModifiedDate: Joi.string().required(),
    eTag: Joi.string(),
    state: Joi.string().required(),
    tags: Joi.array().items(Joi.object()),
    sticky: Joi.boolean().required(),
    editable: Joi.boolean(),
    deletable: Joi.boolean(),
    body: Joi.string(),
    title: Joi.string(),
  }).unknown();

  const req_id = context.awsRequestId;
  try {
    const eventBody = JSON.parse(event.body || '');

    await schema.validateAsync(eventBody);

    const cueLiveEntryQueueRecord: CueLiveEntryQueueRecord = {
      req_id,
      cueLiveEntry: eventBody,
    };

    log.info(
      { cueLiveEntry: eventBody, headers: event.headers, req_id },
      'eventParsed'
    );
    await queueAdd(cueLiveEntryQueueRecord);

    return await respondSuccess(cueLiveEntryQueueRecord);
  } catch (err) {
    Object.assign(err, { payload: event, req_id });
    return await respondFailure(err);
  }
};
