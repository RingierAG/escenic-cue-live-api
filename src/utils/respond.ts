import { APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError } from 'joi';
import { Logger } from './logger';

const log = Logger.getLogger({
  service: 'respond',
});

export const respondFailure = async (
  error: unknown,
  code?: number
): Promise<APIGatewayProxyResult> => {
  let statusCode = 500;
  let errors: Array<string> = ['Internal server error'];

  if (error instanceof ValidationError) {
    statusCode = 422;
    errors = error.details.map((detail) => detail.message);
  }

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
