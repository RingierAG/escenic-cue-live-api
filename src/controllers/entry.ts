import { Logger } from '../utils/logger';

const log = Logger.getLogger({
  service: 'cueLiveEntryController',
});

import * as dynamodb from '../services/dynamodb';
import { CueLiveEntriesResponse, CueLiveEntry } from '../models/cueLiveEntry';
import { CueLiveEntryQueueRecord } from '../models/sqs-records';
import { Cook } from '../helpers/cook';

export class EntryController {
  static async fetchEntries(
    eventId: number,
    before?: string,
    after?: string,
    limit?: number
  ): Promise<CueLiveEntriesResponse> {
    const cueLiveNonStickyEntries = await dynamodb.getEntries(
      eventId,
      before,
      after,
      false,
      limit
    );

    const cueLiveStickyEntries = await dynamodb.getEntries(
      eventId,
      before,
      after,
      true,
      limit
    );

    return {
      entries: cueLiveNonStickyEntries,
      sticky: cueLiveStickyEntries,
    };
  }

  static async fetchEntry(eventId: number, id: number) {
    const cueLiveEntry = await dynamodb.getEntry(eventId, id);
    return cueLiveEntry;
  }

  static async processEntryFromSQS(record: CueLiveEntryQueueRecord) {
    const cueLiveEntry = await CueLiveEntry.fromObject(record.cueLiveEntry);

    const data = await Cook.fetchEntryBody(
      cueLiveEntry.id,
      cueLiveEntry.title,
      cueLiveEntry.body
    );
    cueLiveEntry.values = data.values;

    log.info({ cueLiveEntry }, 'enrichedEvent');

    await cueLiveEntry.save();

    return cueLiveEntry;
  }
}
