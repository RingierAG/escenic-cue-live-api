'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CueLiveEntry = void 0;
const cook_1 = require('../helpers/cook');
class CueLiveEntry {
  constructor(id, eventId) {
    this.id = id;
    this.eventId = eventId;
  }
  async init() {
    const data = await cook_1.Cook.getEntryBody(this.id);
    Object.assign(this, data);
  }
}
exports.CueLiveEntry = CueLiveEntry;
//# sourceMappingURL=cueLiveEntry.js.map
