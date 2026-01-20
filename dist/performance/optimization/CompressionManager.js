"use strict";
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
exports.CompressionManager = void 0;
const events_1 = require("events");
const zlib = __importStar(require("zlib"));
/**
 * Response compression management system
 */
class CompressionManager extends events_1.EventEmitter {
    constructor(logger, config) {
        super();
        this.logger = logger;
        this.config = config;
    }
    async compressResponse(response) {
        const startTime = Date.now();
        const originalData = JSON.stringify(response.data);
        const originalSize = Buffer.byteLength(originalData, 'utf8');
        if (originalSize < this.config.compressionThreshold) {
            return {
                data: Buffer.from(originalData),
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 1,
                algorithm: 'none',
                compressionTime: 0
            };
        }
        try {
            const compressed = zlib.gzipSync(originalData);
            const compressionTime = Date.now() - startTime;
            const compressionRatio = originalSize / compressed.length;
            this.emit('compression_completed', {
                originalSize,
                compressedSize: compressed.length,
                compressionRatio,
                compressionTime
            });
            return {
                data: compressed,
                originalSize,
                compressedSize: compressed.length,
                compressionRatio,
                algorithm: 'gzip',
                compressionTime
            };
        }
        catch (error) {
            this.logger.error('Compression failed:', error);
            return {
                data: Buffer.from(originalData),
                originalSize,
                compressedSize: originalSize,
                compressionRatio: 1,
                algorithm: 'none',
                compressionTime: Date.now() - startTime
            };
        }
    }
}
exports.CompressionManager = CompressionManager;
//# sourceMappingURL=CompressionManager.js.map