import axios, { AxiosResponse } from 'axios';
import { AxiosApiConfig } from '../models/config/axiosApiConfig';
import { Logger } from '../utils/logger';

const log = Logger.getLogger({
  service: 'axios',
});

export abstract class Axios {
  static async post<payloadType>(
    payload: payloadType,
    config: AxiosApiConfig
  ): Promise<any> {
    try {
      const res = await axios.post(
        config.endpoint,
        {
          ...payload,
        },
        {
          headers: config.headers,
          params: config.params,
        }
      );

      if (!res.data) {
        throw new Error('No proper payload provided');
      }

      return res.data;
    } catch (err) {
      const error = new Error(`Pushing article to ${config.endpoint}`);
      Object.assign(error, { cause: err, payload });
      throw error;
    }
  }

  static async get<ResponseType = any>(
    path: string,
    config: AxiosApiConfig
  ): Promise<ResponseType> {
    const url = `${config.endpoint}${
      config.pathPrefix ? config.pathPrefix : ''
    }${path}`;
    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: config.headers,
        timeout: config.timeout,
      });
      if (response.status !== 200) {
        throw new Error('Bad status from Cook');
      }

      return response.data;
    } catch (err) {
      const error = new Error(`Axios - Error fetching ${url}`);
      Object.assign(error, { cause: err, url, config });
      throw error;
    }
  }
}
