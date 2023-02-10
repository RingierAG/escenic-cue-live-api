import { APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from './logger';

const log = Logger.getLogger({
  service: 'respond',
});

export const respondFailure = async (
  error: unknown,
  code?: number
): Promise<APIGatewayProxyResult> => {
  const statusCode = code || 500;
  const errors: Array<string> = ['Internal server error'];

  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      statusCode: statusCode,
      errors,
    }),
  };

  log.error(error as Error);
  return Promise.resolve(response);
};

export const respondSuccess = (
  data: unknown
): Promise<APIGatewayProxyResult> => {
  if (data) {
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    return Promise.resolve(response);
  } else {
    const error = new Error('Missing data');
    return respondFailure(error);
  }
};
