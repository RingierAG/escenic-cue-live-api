'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const config_1 = __importDefault(require('../config'));
const logger_1 = require('../utils/logger');
logger_1.Logger.createLogger('consumer', config_1.default.log.LOG_LEVEL);
const log = logger_1.Logger.getLogger({
  service: 'handler',
});
const respond_1 = require('../utils/respond');
const cueLiveEntry_1 = require('../models/cueLiveEntry');
const processSQSRecord = async (record) => {
  const { id, eventId, req_id } = record;
  const cueLiveEntry = new cueLiveEntry_1.CueLiveEntry(id, eventId);
  await cueLiveEntry.init();
  log.info({ payload: { cueLiveEntry, req_id } }, 'event');
  return;
};
/**
 *
 * @param event SQS Event
 * @param context Lambda Context
 * @returns Throws an error in case of failure in order to reprocess the event and
 * completes successfully if the event is posted to the Event Bus
 */
const handler = async (event, context) => {
  logger_1.Logger.withRequest(event, context);
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    log.info(event.Records, 'receivedRecords');
    const responses = [];
    for (const record of event.Records) {
      responses.push(await processSQSRecord(JSON.parse(record.body)));
    }
    return (0, respond_1.respondSuccess)(responses);
  } catch (error) {
    log.error(error);
    throw error;
  }
};
exports.handler = handler;
//# sourceMappingURL=consumer.js.map
