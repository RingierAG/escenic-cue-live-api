'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Logger = void 0;
const pino_1 = __importDefault(require('pino'));
const pino_lambda_1 = require('pino-lambda');
const { stdSerializers } = pino_1.default;
class Logger {
  static createLogger(logName, logLevel) {
    const destination = (0, pino_lambda_1.pinoLambdaDestination)({
      formatter: new pino_lambda_1.PinoLogFormatter(),
    });
    this.instance = (0, pino_1.default)(
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
  static getLogger(options) {
    if (!this.instance) {
      throw new Error('Did you forgot to initialize the logger?');
    }
    return this.instance.child(options);
  }
}
exports.Logger = Logger;
// Used to set an id (x-correlation-id) across all logs
// and allowing the quering all log entries based on a single id
Logger.withRequest = (0, pino_lambda_1.lambdaRequestTracker)({
  requestMixin: (event, context) => {
    var _a, _b, _c, _d, _e;
    return {
      // if the lambda is triggered by SQS then try to reuse
      // x-correlation-id otherwise fallback to the default (awsRequestId)
      'x-correlation-id':
        (_e =
          (_d =
            (_c =
              (_b =
                (_a =
                  event === null || event === void 0
                    ? void 0
                    : event.Records) === null || _a === void 0
                  ? void 0
                  : _a[0]) === null || _b === void 0
                ? void 0
                : _b.messageAttributes) === null || _c === void 0
              ? void 0
              : _c['x-correlation-id']) === null || _d === void 0
            ? void 0
            : _d.stringValue) !== null && _e !== void 0
          ? _e
          : context === null || context === void 0
          ? void 0
          : context.awsRequestId,
    };
  },
});
//# sourceMappingURL=logger.js.map
