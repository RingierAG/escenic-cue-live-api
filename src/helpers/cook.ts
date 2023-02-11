import { CueLiveEntryFromCook } from '../models/cueLiveEntry';
import cookConfig from '../config/cook';
import { Axios } from '../services/axios';
export abstract class Cook {
  static async fetchEntryBody(entryId: number): Promise<CueLiveEntryFromCook> {
    return await Axios.get(`/${entryId}`, cookConfig);
  }
}
