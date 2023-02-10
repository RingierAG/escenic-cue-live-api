'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Axios = void 0;
const axios_1 = __importDefault(require('axios'));
const logger_1 = require('../utils/logger');
const log = logger_1.Logger.getLogger({
  service: 'axios',
});
class Axios {
  static async post(payload, config) {
    try {
      const res = await axios_1.default.post(
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
  static async get(path, config) {
    try {
      const response = await axios_1.default.get(
        `${config.endpoint}${
          config.pathPrefix ? config.pathPrefix : ''
        }${path}`,
        {
          headers: config.headers,
          timeout: config.timeout,
        }
      );
      if (response.status !== 200) {
        throw new Error('Bad status from Cook');
      }
      return response.data;
    } catch (err) {
      const error = new Error(`Axios - Error fetching ${path}`);
      Object.assign(error, { cause: err, path, config });
      throw error;
    }
  }
}
exports.Axios = Axios;
//# sourceMappingURL=axios.js.map
