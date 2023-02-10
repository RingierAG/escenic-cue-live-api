import pino from 'pino';
import {
  PinoLogFormatter,
  pinoLambdaDestination,
  lambdaRequestTracker,
} from 'pino-lambda';

const { stdSerializers } = pino;

export class Logger {
  static instance: pino.Logger;

  static createLogger(logName: string, logLevel: string) {
    const destination = pinoLambdaDestination({
      formatter: new PinoLogFormatter(),
    });
    this.instance = pino(
      {
        name: logName,
        level: logLevel,
        serializers: {
          cause: stdSerializers.err,
        },
      },
      destination
    );

    return this.instance;
  }

  static getLogger(options: pino.Bindings): pino.Logger {
    if (!this.instance) {
      throw new Error('Did you forgot to initialize the logger?');
    }

    return this.instance.child(options);
  }

  // Used to set an id (x-correlation-id) across all logs
  // and allowing the quering all log entries based on a single id
  static withRequest = lambdaRequestTracker({
    requestMixin: (event, context) => {
      return {
        // if the lambda is triggered by SQS then try to reuse
        // x-correlation-id otherwise fallback to the default (awsRequestId)
        'x-correlation-id':
          event?.Records?.[0]?.messageAttributes?.['x-correlation-id']
            ?.stringValue ?? context?.awsRequestId,
      };
    },
  });
}
