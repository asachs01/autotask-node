import { EventEmitter } from 'events';
import winston from 'winston';
import { OptimizationConfig, BatchResponse, CompressionResult } from '../types/OptimizationTypes';
import * as zlib from 'zlib';

/**
 * Response compression management system
 */
export class CompressionManager extends EventEmitter {
  constructor(
    private logger: winston.Logger,
    private config: Required<OptimizationConfig>
  ) {
    super();
  }

  async compressResponse(response: BatchResponse): Promise<CompressionResult> {
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
    } catch (error) {
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