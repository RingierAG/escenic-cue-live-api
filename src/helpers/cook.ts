import { CueLiveEntry } from 'src/models/cueLiveEntry';
import cookConfig from '../config/cook';
import { Axios } from '../services/axios';
export abstract class Cook {
  static async getEntryBody(entryId: number): Promise<CueLiveEntry> {
    const data = (await Axios.get(`/${entryId}`, cookConfig)) as CueLiveEntry;

    return data;
  }
}
