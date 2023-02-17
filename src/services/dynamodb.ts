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
  before: string | undefined,
  after: string | undefined,
  sticky: boolean = false,
  limit = config.dynamodb.limit
): Promise<Array<CueLiveEntry>> => {
  const ScanIndexForward = !!after && !before;
  // Sort Key is the concatenation of sticky, publisedDate and id
  // in order for the before filter to match records with the same publisedDate
  // we need to append a character to the end of the string which has bigger UTF-8 value than any number
  // e.g If we want to get the entry with id 99 and sort key 0#1676312802000#99 with a before filter
  // we have to query like sticky-publishedDate-id <= 0#1676312802000#A (0#1676312802000) wouldn't work
  if (sticky) {
    before = before ? `${before}` : '2#';
    after = after ? `${after}` : '1#';
  } else {
    before = before ? `${before}` : '1#';
    after = after ? `${after}` : '0#';
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
        // If only after is specified, then we need to get the entries in ascending order
        ScanIndexForward,
        ExpressionAttributeValues: marshall(attributesValues),
        ExpressionAttributeNames: {
          '#pk': CueLiveEntry.pkName,
          '#sk': CueLiveEntry.skName,
        },
        Limit: limit,
      })
    );

    return results?.Count
      ? (results?.Items?.map(unmarshall) as Array<CueLiveEntry>).map(
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
          [CueLiveEntry.skName]: cueLiveEntry.getSortKeyValue(),
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
