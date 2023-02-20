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
    beforeOrAfterFilter: string | undefined,
    limit: number,
    isBeforeQuery: boolean
  ): Promise<CueLiveEntriesResponse> {
    const filter = beforeOrAfterFilter || undefined;
    const oppositeCursorFilterBefore = isBeforeQuery ? undefined : filter;
    const oppositeCursorFilterAfter = isBeforeQuery ? filter : undefined;
    const oppositeCursorFilterLimit = 1;

    let cueLiveNonStickyEntries = await dynamodb.getEntries(
      eventId,
      isBeforeQuery ? filter : undefined,
      isBeforeQuery ? undefined : filter,
      false,
      limit + 1 // +1 for the cursor
    );

    const cursor =
      cueLiveNonStickyEntries.length > limit
        ? cueLiveNonStickyEntries?.pop()?.getSortKeyValue(true)
        : undefined;

    // Fetching 2 entries on the opposite direction
    const oppositeCursorResponse = beforeOrAfterFilter
      ? await dynamodb.getEntries(
          eventId,
          oppositeCursorFilterBefore,
          oppositeCursorFilterAfter,
          false,
          oppositeCursorFilterLimit + 1
        )
      : [];

    const oppositeCursor = oppositeCursorResponse?.[
      oppositeCursorFilterLimit
    ]?.getSortKeyValue(true);

    const cueLiveStickyEntries = await dynamodb.getEntries(
      eventId,
      undefined,
      undefined,
      true,
      config.dynamodb.stickyEntriesLimit
    );
    cueLiveNonStickyEntries.sort(EntryController.sort);

    const newest = cueLiveNonStickyEntries?.[0]?.getSortKeyValue(true);
    const oldest = cueLiveNonStickyEntries?.[
      cueLiveNonStickyEntries.length - 1
    ]?.getSortKeyValue(true);

    return {
      entries: cueLiveNonStickyEntries,
      sticky: cueLiveStickyEntries,
      beforeCursor: isBeforeQuery ? cursor : oppositeCursor,
      afterCursor: isBeforeQuery ? oppositeCursor : cursor,
      newest,
      oldest,
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

  public static sort = (a: CueLiveEntry, b: CueLiveEntry) =>
    // Descending order
    a.getSortKeyValue() > b.getSortKeyValue()
      ? -1
      : a.getSortKeyValue() < b.getSortKeyValue()
      ? 1
      : 0;
}
