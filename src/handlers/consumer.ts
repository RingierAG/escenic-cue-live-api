import { SQSEvent, Context } from 'aws-lambda';

import config from '../config';
import { Logger } from '../utils/logger';

Logger.createLogger('consumer', config.log.LOG_LEVEL);

const log = Logger.getLogger({
  service: 'handler',
});
import { CueLiveEntryQueueRecord } from '../models/sqs-records';
import { respondSuccess } from '../utils/respond';
import { CueLiveEntry } from '../models/cueLiveEntry';

const processSQSRecord = async (record: CueLiveEntryQueueRecord) => {
  const { id, eventId, req_id } = record;

  const cueLiveEntry = new CueLiveEntry(id, eventId);
  await cueLiveEntry.init();

  log.info({ payload: { cueLiveEntry, req_id } }, 'event');

  return Promise.resolve();
};

/**
 *
 * @param event SQS Event
 * @param context Lambda Context
 * @returns Throws an error in case of failure in order to reprocess the event and
 * completes successfully if the event is posted to the Event Bus
 */
export const handler = async (event: SQSEvent, context: Context) => {
  Logger.withRequest(event, context);
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    log.info(event.Records, 'receivedRecords');
    const responses = [];
    for (const record of event.Records) {
      responses.push(
        await processSQSRecord(
          JSON.parse(record.body) as CueLiveEntryQueueRecord
        )
      );
    }
    return respondSuccess(responses);
  } catch (error) {
    log.error(error);
    throw error;
  }
};
