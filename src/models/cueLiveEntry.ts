import { Logger } from '../utils/logger';

const log = Logger.getLogger({
  service: 'cueLiveEntry',
});

import { deleteEntry, putItem } from '../services/dynamodb';
import { Cook } from '../helpers/cook';

export interface CueLiveEntryFromCook {
  values: Array<Object>;
}
export class CueLiveEntry {
  // Dynamo Table's Composite Sort Key
  publishDateId: string;

  constructor(
    public id: number,
    public eventId: number,
    public author: Object,
    public creator: Object,
    public creationDate: number,
    public publishDate: number,
    public lastModifiedDate: number,
    public eTag: string,
    public state: string,
    public tags: Array<Object>,
    public sticky: Boolean,
    public editable: Boolean,
    public deletable: Boolean,
    public values?: Array<Object>
  ) {
    this.publishDateId = `${publishDate}#${id}`;
  }

  static async init(entry: CueLiveEntry): Promise<CueLiveEntry> {
    const cueLiveEntry = new CueLiveEntry(
      entry.id,
      entry.eventId,
      entry.author,
      entry.creator,
      new Date(entry.creationDate).getTime(),
      new Date(entry.publishDate).getTime(),
      new Date(entry.lastModifiedDate).getTime(),
      entry.eTag,
      entry.state,
      entry.tags,
      entry.sticky,
      entry.editable,
      entry.deletable,
      entry.values
    );

    await cueLiveEntry.fetchBodyValuesFromCook();

    return cueLiveEntry;
  }

  public isLive(): boolean {
    return this.state === 'published' && this.publishDate < Date.now();
  }

  public async fetchBodyValuesFromCook(): Promise<void> {
    const data = await Cook.fetchEntryBody(this.id);
    this.values = data.values;

    log.info({ cueLiveEntry: this }, 'enrichedEvent');
  }

  public save(): Promise<void> {
    if (this.isLive()) {
      return putItem(this);
    }

    return deleteEntry(this.eventId, this.id);
  }
}
