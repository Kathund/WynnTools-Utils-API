// Credits https://github.com/DuckySoLucky/hypixel-error-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Logger.js (Edited)
const customLevels = { api: 0, error: 1, warn: 2, other: 3, max: 4 };
import { createLogger, format, transports } from 'winston';
import { other } from './config.js';
import { join } from 'path';

const logDirectory = join(__dirname, other.logsFolder);
const timezone = () => {
  if (other.timezone === null) {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  } else {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone: other.timezone,
    });
  }
};
const apiLogger = createLogger({
  level: 'api',
  levels: customLevels,
  format: format.combine(
    format.timestamp({ format: timezone }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new transports.File({ name: 'cache', filename: join(logDirectory, 'api.log'), level: 'api' }),
    new transports.File({ name: 'combined', filename: join(logDirectory, 'combined.log'), level: 'max' }),
    new transports.Console({ levels: 'max' }),
  ],
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
  transports: [
    new transports.File({
      name: 'error',
      filename: join(logDirectory, 'error.log'),
      level: 'error',
    }),
    new transports.File({ name: 'combined', filename: join(logDirectory, 'combined.log'), level: 'max' }),
    new transports.Console({ levels: 'max' }),
  ],
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
  transports: [
    new transports.File({ name: 'warn', filename: join(logDirectory, 'warn.log'), level: 'warn' }),
    new transports.File({ name: 'combined', filename: join(logDirectory, 'combined.log'), level: 'max' }),
    new transports.Console({ levels: 'max' }),
  ],
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
  transports: [
    new transports.File({ name: 'other', filename: join(logDirectory, 'other.log'), level: 'other' }),
    new transports.File({ name: 'combined', filename: join(logDirectory, 'combined.log'), level: 'max' }),
    new transports.Console({ levels: 'max' }),
  ],
});

const logger = {
  api: (...args) => {
    return apiLogger.api(args.join(' | '));
  },
  error: (params) => {
    return errorLogger.error(params);
  },
  warn: (params) => {
    return warnLogger.warn(params);
  },
  other: (params) => {
    return otherLogger.other(params);
  },
};

export const apiMessage = logger.api;
export const errorMessage = logger.error;
export const warnMessage = logger.warn;
export const otherMessage = logger.other;
