import logConfig from './src/config/log';
import { Logger } from './src/utils/logger';
jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));

Logger.createLogger(logConfig.LOG_NAME, logConfig.LOG_LEVEL);
