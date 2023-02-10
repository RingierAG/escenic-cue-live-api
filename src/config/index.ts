import * as dotenv from 'dotenv';
dotenv.config();
import log, { LogConfig } from './log';
import cook from './cook';
import sqs, { SqsConfig } from './sqs';
import dynamodb, { DynamoDBConfig } from './dynamodb';
import { AxiosApiConfig } from '../models/config/axiosApiConfig';

interface Config {
  log: LogConfig;
  sqs: SqsConfig;
  cook: AxiosApiConfig;
  dynamodb: DynamoDBConfig;
}

const config: Config = {
  log: log,
  sqs: sqs,
  cook: cook,
  dynamodb: dynamodb,
};

export default config;
