const env = process.env;
export interface DynamoDBConfig {
  readonly tableName: string;
}

const dynamoDBConfig: DynamoDBConfig = {
  tableName:
    env.BLICK_ESCENIC_CUE_LIVE_ENTRIES_TABLE_NAME ||
    'local-escenic-escenic-cue-live-api-entries-table',
};

export default dynamoDBConfig;
