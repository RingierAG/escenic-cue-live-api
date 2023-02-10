import { AxiosApiConfig } from '../models/config/axiosApiConfig';

const env = process.env;

const cookConfig: AxiosApiConfig = {
  endpoint: env.BLICK_COOK_ENDPOINT || `https://mock.test.blick.ch`,
  headers: {
    'User-Agent': 'internal-blick-escenic-cue-live-api',
  },
  timeout: 3000,
  pathPrefix: '/blick/cue-live/entry',
};

export default cookConfig;
