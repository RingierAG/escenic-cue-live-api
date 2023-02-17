import { deleteEntry, putItem } from '../services/dynamodb';

const PK_NAME = 'eventId';
const SK_NAME = 'sticky-publishedDate-id';
export interface CueLiveEntriesResponse {
  entries: CueLiveEntry[];
  sticky: CueLiveEntry[];
  beforeCursor: string | undefined;
  afterCursor: string | undefined;
}

export interface CueLiveEntryFromCook {
  values: Array<Object>;
}
export class CueLiveEntry {
  static pkName = PK_NAME;
  static skName = SK_NAME;
  // Dynamo Table's Composite Sort Key
  [SK_NAME]: string;
  constructor(
    public id: number,
    public eventId: number,
    public author: Object,
    public creator: Object,
    public createdDate: number,
    public publishedDate: number,
    public lastModifiedDate: number,
    public eTag: string,
    public state: string,
    public tags: Array<Object>,
    public sticky: Boolean,
    public editable: Boolean,
    public deletable: Boolean,
    // TODO: Delete after cook is live
    public body: string,
    // TODO: Delete after cook is live
    public title: string,
    public values?: Array<Object>
  ) {
    // DynamoDb composite sort key
    this[SK_NAME] = `${sticky ? '1' : '0'}#${publishedDate}#${id}`;
  }

  /**
   *
   * @param entry - Object with CueLiveEntry props but not an instance of the class
   * @param fetchBodyValuesFromCook - Flag to indicate whether to fetch the entry body from Cook
   * @returns
   */
  static fromObject(entry: CueLiveEntry): CueLiveEntry {
    const cueLiveEntry = new CueLiveEntry(
      entry.id,
      entry.eventId,
      entry.author,
      entry.creator,
      new Date(entry.createdDate).getTime(),
      new Date(entry.publishedDate).getTime(),
      new Date(entry.lastModifiedDate).getTime(),
      entry.eTag,
      entry.state,
      entry.tags,
      entry.sticky,
      entry.editable,
      entry.deletable,
      //Todo Delete after cook is ready
      entry.body,
      entry.title,
      entry.values
    );

    return cueLiveEntry;
  }

  public isLive(): boolean {
    return this.state === 'published' && this.publishedDate < Date.now();
  }

  public getSortKeyValue(): string {
    return this[SK_NAME];
  }

  public async save(): Promise<void> {
    await deleteEntry(this.eventId, this.id);

    if (this.isLive()) {
      return putItem(this);
    }

    return Promise.resolve();
  }
}
