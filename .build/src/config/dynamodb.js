'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const env = process.env;
const dynamoDBConfig = {
  tableName:
    env.BLICK_ESCENIC_CUE_LIVE_ENTRIES_TABLE_NAME ||
    'local-escenic-escenic-cue-live-api-entries-table',
};
exports.default = dynamoDBConfig;
//# sourceMappingURL=dynamodb.js.map
