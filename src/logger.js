// Credits https://github.com/DuckySoLucky/hypixel-error-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Logger.js (Edited)
const customLevels = { api: 0, server: 1, error: 2, warn: 3, other: 4, max: 5 };
const config = require('../config.json');
const winston = require('winston');
const path = require('path');

const logDirectory = path.join(__dirname, config.logsFolder);
const timezone = () => {
  if (config.timezone === null) {
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
      timeZone: config.other.timezone,
    });
  }
};
const apiLogger = winston.createLogger({
  level: 'api',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: timezone }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'cache', filename: path.join(logDirectory, 'api.log'), level: 'api' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const serverLogger = winston.createLogger({
  level: 'server',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: timezone }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      name: 'server',
      filename: path.join(logDirectory, 'server.log'),
      level: 'server',
    }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const errorLogger = winston.createLogger({
  level: 'error',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: timezone }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      name: 'error',
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const warnLogger = winston.createLogger({
  level: 'warn',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: timezone }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'warn', filename: path.join(logDirectory, 'warn.log'), level: 'warn' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const otherLogger = winston.createLogger({
  level: 'other',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: timezone }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'other', filename: path.join(logDirectory, 'other.log'), level: 'other' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const logger = {
  api: (params) => {
    return apiLogger.api(params);
  },
  server: (params) => {
    return serverLogger.server(params);
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

module.exports = {
  apiMessage: logger.api,
  serverMessage: logger.server,
  errorMessage: logger.error,
  warnMessage: logger.warn,
  otherMessage: logger.other,
};
