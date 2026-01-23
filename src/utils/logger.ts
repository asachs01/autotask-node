/**
 * Logger utility for the migration framework
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Try to create logs directory — skip file logging if not possible
// (e.g., when used as a library in an MCP server where cwd may be unwritable)
let logsDir: string | null = null;
try {
  const dir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  logsDir = dir;
} catch {
  // Can't create logs directory — file logging will be skipped
}

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let log = `${timestamp} [${service || 'app'}] ${level}: ${message}`;

    // Add metadata if present
    const metaKeys = Object.keys(meta).filter(
      key =>
        key !== 'timestamp' &&
        key !== 'level' &&
        key !== 'message' &&
        key !== 'service'
    );
    if (metaKeys.length > 0) {
      const metaString = metaKeys
        .map(key => `${key}=${JSON.stringify(meta[key])}`)
        .join(' ');
      log += ` ${metaString}`;
    }

    return log;
  })
);

export function createLogger(service: string): winston.Logger {
  const transports: winston.transport[] = [
    // Console transport with colored output
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.CONSOLE_LOG_LEVEL || 'info',
    }),
  ];

  // Only add file transports if the logs directory is available
  if (logsDir) {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'migration.log'),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3,
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service },
    transports,
  });
}

export const logger = createLogger('migration-framework');
