import { APIGatewayEvent, Context } from 'aws-lambda';
import { lambdaRequestTracker } from 'pino-lambda';
import Joi from 'joi';

import config from '../config';
import { Logger } from '../utils/logger';

Logger.createLogger('fetcher', config.log.LOG_LEVEL);
const withRequest = lambdaRequestTracker();

const log = Logger.getLogger({
  service: 'handler',
});
import { respondSuccess, respondFailure } from '../utils/respond';
import { EntryController } from '../controllers/entry';

const schemas = {
  entries: Joi.object({
    eventId: Joi.number().required(),
    before: Joi.string(),
    after: Joi.string(),
    limit: Joi.number(),
  }).unknown(),
  entry: Joi.object({
    eventId: Joi.number().required(),
    id: Joi.number().required(),
  }).unknown(),
};

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

  const req_id = context.awsRequestId;

  try {
    const reqType = event.path.split('/')[1];
    let schema = reqType === 'entries' ? schemas.entries : schemas.entry;
    const { before, after, limit, eventId, id } = await schema.validateAsync({
      ...event.queryStringParameters,
      ...event.pathParameters,
    });

    if (reqType == 'entry' && id) {
      const entry = await EntryController.fetchEntry(eventId, id);
      return await respondSuccess(entry);
    }

    const cueLiveEntries = await EntryController.fetchEntries(
      eventId,
      before,
      after,
      limit
    );

    return await respondSuccess(cueLiveEntries);
  } catch (err) {
    Object.assign(err, { payload: event, req_id });
    return await respondFailure(err);
  }
};