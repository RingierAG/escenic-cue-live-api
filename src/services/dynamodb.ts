import AWSXRay from 'aws-xray-sdk';
import {
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'; // ES6 import
import { CueLiveEntry } from '../models/cueLiveEntry';
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

import config from '../config';

const params: DynamoDBClientConfig = {
  region: config.dynamodb.region,
};

// Serverless offline env variable
// Access local dynamodb when debugging
if (process.env.IS_OFFLINE) {
  // params.region = 'localhost';
  // params.endpoint = 'http://localhost:8000';
}
const client = AWSXRay.captureAWSv3Client(new DynamoDBClient(params));

export const putItem = async (item: CueLiveEntry) => {
  try {
    await client.send(
      new PutItemCommand({
        TableName: config.dynamodb.tableName,
        Item: marshall(item, {
          convertClassInstanceToMap: true,
          removeUndefinedValues: true,
        }),
      })
    );
  } catch (err) {
    const error = new Error(
      `Error putting item in DynamoDB's ${config.dynamodb.tableName}`
    );
    Object.assign(error, { cause: err, item });
    throw error;
  }
};

export const getEntries = async (
  eventId: number,
  before?: string,
  after?: string,
  sticky: boolean = false,
  limit = config.dynamodb.limit
): Promise<Array<CueLiveEntry>> => {
  if (sticky) {
    before = before ? `1#${before}` : '2#';
    after = after ? `1#${after}` : '1#';
  } else {
    before = before ? `0#${before}` : '1#';
    after = after ? `0#${after}` : '0#';
  }

  let KeyConditionExpression = '#pk = :eventId';
  const attributesValues: any = {
    ':eventId': eventId,
  };

  KeyConditionExpression += ` and #sk between :after AND :before`;
  attributesValues[':before'] = before;
  attributesValues[':after'] = after;

  try {
    console.log(marshall(attributesValues), KeyConditionExpression);
    const results = await client.send(
      new QueryCommand({
        TableName: config.dynamodb.tableName,
        KeyConditionExpression,
        ScanIndexForward: false,
        ExpressionAttributeValues: marshall(attributesValues),
        ExpressionAttributeNames: {
          '#pk': 'eventId',
          '#sk': 'sticky-publishedDate-id',
        },
        Limit: limit,
      })
    );

    return results?.Items?.length
      ? (results.Items.map(unmarshall) as Array<CueLiveEntry>).map(
          CueLiveEntry.fromObject
        )
      : [];
  } catch (err) {
    const error = new Error(
      `Error fetching entries from DynamoDB's ${config.dynamodb.tableName}`
    );
    Object.assign(error, {
      cause: err,
      KeyConditionExpression,
      eventId,
    });
    throw error;
  }
};

export const getEntry = async (
  eventId: number,
  id: number
): Promise<CueLiveEntry | undefined> => {
  const results = await client.send(
    new QueryCommand({
      TableName: config.dynamodb.tableName,
      IndexName: 'byEntryId',
      KeyConditionExpression: 'eventId = :eventId AND id = :id',
      ExpressionAttributeValues: marshall({
        ':eventId': eventId,
        ':id': id,
      }),
    })
  );

  return results?.Items?.length
    ? CueLiveEntry.fromObject(unmarshall(results.Items[0]))
    : undefined;
};

export const deleteEntry = async (eventId: number, id: number) => {
  try {
    const cueLiveEntry = await getEntry(eventId, id);

    if (!cueLiveEntry) return Promise.resolve();

    await client.send(
      new DeleteItemCommand({
        TableName: config.dynamodb.tableName,
        Key: marshall({
          eventId: cueLiveEntry.eventId,
          'sticky-publishedDate-id': cueLiveEntry['sticky-publishedDate-id'],
        }),
      })
    );
  } catch (err) {
    const error = new Error(
      `Error deleting item in DynamoDB ${config.dynamodb.tableName}`
    );
    Object.assign(error, {
      cause: err,
      eventId,
      id,
    });
    throw error;
  }
};
