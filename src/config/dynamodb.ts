const env = process.env;
export interface DynamoDBConfig {
  readonly region: string;
  readonly tableName: string;
  readonly limit: number;
}

const dynamoDBConfig: DynamoDBConfig = {
  region: env.AWS_REGION || 'eu-central-1',
  tableName:
    env.BLICK_ESCENIC_CUE_LIVE_ENTRIES_TABLE_NAME ||
    'local-escenic-escenic-cue-live-api-entries-table',
  limit: 10,
};

export default dynamoDBConfig;
