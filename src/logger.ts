const customLevels = { api: 0, error: 1, warn: 2, other: 3, mongo: 4, max: 5 };
import { createLogger, format, transports } from 'winston';

const timezone = () => {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
};

const apiTransport = new transports.File({
  level: 'api',
  filename: './logs/api.log',
});

const errorTransport = new transports.File({
  level: 'error',
  filename: './logs/error.log',
});

const warnTransport = new transports.File({
  level: 'warn',
  filename: './logs/warn.log',
});

const otherTransport = new transports.File({
  level: 'other',
  filename: './logs/log',
});

const combinedTransport = new transports.File({
  level: 'max',
  filename: './logs/combined.log',
});

const mongoTransport = new transports.File({
  level: 'mongo',
  filename: './logs/mongo.log',
});

const consoleTransport = new transports.Console({
  level: 'max',
});

const apiLogger = createLogger({
  level: 'api',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [apiTransport, combinedTransport, consoleTransport],
});

const errorLogger = createLogger({
  level: 'error',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [errorTransport, combinedTransport, consoleTransport],
});

const warnLogger = createLogger({
  level: 'warn',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [warnTransport, combinedTransport, consoleTransport],
});

const otherLogger = createLogger({
  level: 'other',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [otherTransport, combinedTransport, consoleTransport],
});

const mongoLogger = createLogger({
  level: 'mongo',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [mongoTransport, combinedTransport, consoleTransport],
});

const logger = {
  api: (endPoint: string, message: string) => {
    apiLogger.log('api', `${endPoint} | ${message}`);
  },
  error: (message: string) => {
    errorLogger.log('error', message);
  },
  warn: (message: string) => {
    warnLogger.log('warn', message);
  },
  other: (message: string) => {
    otherLogger.log('other', message);
  },
  mongo: (message: string) => {
    mongoLogger.log('mongo', message);
  },
};

export const apiMessage = logger.api;
export const errorMessage = logger.error;
export const warnMessage = logger.warn;
export const otherMessage = logger.other;
export const mongoMessage = logger.mongo;
