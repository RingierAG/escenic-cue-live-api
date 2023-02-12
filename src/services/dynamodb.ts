import {
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
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
  params.region = 'localhost';
  params.endpoint = 'http://localhost:8000';
}
const client = new DynamoDBClient(params);

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
      `Error putting item in DynamoDB ${config.dynamodb.tableName}`
    );
    Object.assign(error, { cause: err, item });
    throw error;
  }
};

export const getEntry = async (eventId: number, id: number) => {
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
          publishDateId: cueLiveEntry.publishDateId,
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
