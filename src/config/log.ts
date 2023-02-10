const env = process.env;

export interface LogConfig {
  readonly LOG_LEVEL: string;
  readonly LOG_NAME: string;
}

const logsConfig: LogConfig = {
  LOG_LEVEL: env.LOG_LEVEL || 'debug',
  LOG_NAME: 'escenic-cue-live',
};

export default logsConfig;
