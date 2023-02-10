import { Cook } from '../helpers/cook';

interface CueLiveCookEntry {
  id: number;
  author?: Object;
  creator?: Object;

  creationDate?: Date;

  publishDate?: Date;

  lastModifiedDate?: Date;

  values?: Array<Object>;

  self?: String;

  state?: String;

  tags?: Array<Object>;

  sticky?: Boolean;

  editable?: Boolean;
}

export class CueLiveEntry implements CueLiveCookEntry {
  id: number;
  eventId: number;

  constructor(id: number, eventId: number) {
    this.id = id;
    this.eventId = eventId;
  }

  public async init(): Promise<void> {
    const data: CueLiveCookEntry = await Cook.getEntryBody(this.id);

    Object.assign(this, data);
  }
}
