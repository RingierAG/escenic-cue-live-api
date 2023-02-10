'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Cook = void 0;
const cook_1 = __importDefault(require('../config/cook'));
const axios_1 = require('../services/axios');
class Cook {
  static async getEntryBody(entryId) {
    const data = await axios_1.Axios.get(`/${entryId}`, cook_1.default);
    return data;
  }
}
exports.Cook = Cook;
//# sourceMappingURL=cook.js.map
