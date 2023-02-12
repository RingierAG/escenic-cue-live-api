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
      `Error putting item in DynamoDB ${config.dynamodb.tableName}`
    );
    Object.assign(error, { cause: err, item });
    throw error;
  }
};

export const getEntries = async (
  eventId: number,
  before?: number,
  after?: number,
  limit = config.dynamodb.limit
) => {
  // Due to the limitation of the current DynamoDB schema
  // it's not possible to filter out pinned entries during query time
  // as a result, on every query we account for limit for  #limit+maxPinnedEntries
  // which will be then filtered out.

  let KeyConditionExpression = 'eventId = :eventId';
  const attributesValues: any = {
    ':eventId': eventId,
  };

  if (after && !before) {
    KeyConditionExpression += ` and publishDateId > :after`;
    attributesValues[':after'] = after;
  } else if (!after && before) {
    KeyConditionExpression += ` and publishDateId < :before`;
    attributesValues[':before'] = before;
  } else if (after && before) {
    KeyConditionExpression += ` and publishDateId between :before AND :after`;
    attributesValues[':before'] = before;
    attributesValues[':after'] = before;
  }

  try {
    console.log(marshall(attributesValues), KeyConditionExpression);
    const results = await client.send(
      new QueryCommand({
        TableName: config.dynamodb.tableName,
        KeyConditionExpression,
        ScanIndexForward: false,
        ExpressionAttributeValues: marshall(attributesValues),
        Limit: limit + config.dynamodb.maxPinnedEntries,
      })
    );

    return results?.Items?.length ? results.Items.map(unmarshall) : [];
  } catch (err) {
    const error = new Error(
      `Error fetching entriesfrom DynamoDB ${config.dynamodb.tableName}`
    );
    Object.assign(error, {
      cause: err,
      KeyConditionExpression,
      eventId,
    });
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
