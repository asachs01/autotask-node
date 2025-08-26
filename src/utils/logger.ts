/**
 * Logger utility for the migration framework
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
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
    const metaKeys = Object.keys(meta).filter(key => key !== 'timestamp' && key !== 'level' && key !== 'message' && key !== 'service');
    if (metaKeys.length > 0) {
      const metaString = metaKeys.map(key => `${key}=${JSON.stringify(meta[key])}`).join(' ');
      log += ` ${metaString}`;
    }
    
    return log;
  })
);

export function createLogger(service: string): winston.Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service },
    transports: [
      // File transport for all logs
      new winston.transports.File({
        filename: path.join(logsDir, 'migration.log'),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      }),
      
      // Error-only file transport
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3
      }),
      
      // Console transport with colored output
      new winston.transports.Console({
        format: consoleFormat,
        level: process.env.CONSOLE_LOG_LEVEL || 'info'
      })
    ]
  });
}

export const logger = createLogger('migration-framework');