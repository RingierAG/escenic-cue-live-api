import { Logger } from '../utils/logger';

const log = Logger.getLogger({
  service: 'cueLiveEntryController',
});

import config from '../config';
import * as dynamodb from '../services/dynamodb';
import { CueLiveEntriesResponse, CueLiveEntry } from '../models/cueLiveEntry';
import { CueLiveEntryQueueRecord } from '../models/sqs-records';
import { Cook } from '../helpers/cook';

export class EntryController {
  static async fetchEntries(
    eventId: number,
    before: string,
    after: string,
    limit: number
  ): Promise<CueLiveEntriesResponse> {
    let cueLiveNonStickyEntries = await dynamodb.getEntries(
      eventId,
      before,
      after,
      false,
      limit
    );

    const cueLiveStickyEntries = await dynamodb.getEntries(
      eventId,
      undefined,
      undefined,
      true,
      config.dynamodb.stickyEntriesLimit
    );

    const cursor = cueLiveNonStickyEntries?.[limit]?.getSortKeyValue();

    let oppositeCursor;
    if (cueLiveNonStickyEntries.length) {
      const filter = cueLiveNonStickyEntries[
        cueLiveNonStickyEntries.length - 1
      ]?.getSortKeyValue();
      const oppositeCursorFilterBefore = after ? filter : undefined;
      const oppositeCursorFilterAfter = before ? filter : undefined;
      const oppositeCursorLimit = cueLiveNonStickyEntries.length;

      const response = await dynamodb.getEntries(
        eventId,
        oppositeCursorFilterBefore,
        oppositeCursorFilterAfter,
        false,
        oppositeCursorLimit
      );

      // if cursor present in the result
      if (response.length > limit)
        oppositeCursor = response?.[response.length - 1]?.getSortKeyValue();
    }

    // Remove the cursor from the result if exists
    if (cursor) {
      cueLiveNonStickyEntries = cueLiveNonStickyEntries.slice(0, limit);
    }

    const base64Cursor = cursor
      ? Buffer.from(cursor).toString('base64')
      : undefined;
    const base64OppositeCursor = oppositeCursor
      ? Buffer.from(oppositeCursor).toString('base64')
      : undefined;

    return {
      entries: cueLiveNonStickyEntries,
      sticky: cueLiveStickyEntries,
      beforeCursor: before ? base64Cursor : base64OppositeCursor,
      afterCursor: after ? base64Cursor : base64OppositeCursor,
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

  public static paginateAndSort(
    cueLiveNonStickyEntries: CueLiveEntry[],
    cueLiveStickyEntries: CueLiveEntry[],
    before: string,
    after: string,
    limit: number
  ) {}

  public static sortEntries(entries: CueLiveEntry[]) {
    if (!entries.length) return entries;
    return entries.sort((a: CueLiveEntry, b: CueLiveEntry) =>
      // Descending order
      a.getSortKeyValue() > a.getSortKeyValue()
        ? -1
        : a.getSortKeyValue() > a.getSortKeyValue()
        ? 1
        : 0
    );
  }
}
