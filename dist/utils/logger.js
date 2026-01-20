"use strict";
/**
 * Logger utility for the migration framework
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createLogger = createLogger;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let log = `${timestamp} [${service || 'app'}] ${level}: ${message}`;
    // Add metadata if present
    const metaKeys = Object.keys(meta).filter(key => key !== 'timestamp' && key !== 'level' && key !== 'message' && key !== 'service');
    if (metaKeys.length > 0) {
        const metaString = metaKeys.map(key => `${key}=${JSON.stringify(meta[key])}`).join(' ');
        log += ` ${metaString}`;
    }
    return log;
}));
function createLogger(service) {
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
exports.logger = createLogger('migration-framework');
//# sourceMappingURL=logger.js.map