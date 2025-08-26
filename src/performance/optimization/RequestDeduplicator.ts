import { EventEmitter } from 'events';
import winston from 'winston';
import { OptimizationConfig, BatchRequest, BatchResponse, RequestDeduplicationEntry } from '../types/OptimizationTypes';

/**
 * Request deduplication system
 */
export class RequestDeduplicator extends EventEmitter {
  private cache = new Map<string, RequestDeduplicationEntry>();

  constructor(
    private logger: winston.Logger,
    private config: Required<OptimizationConfig>
  ) {
    super();
  }

  async checkDuplication(request: BatchRequest): Promise<BatchResponse | null> {
    const hash = this.generateRequestHash(request);
    const entry = this.cache.get(hash);

    if (entry && entry.expiresAt > Date.now()) {
      entry.duplicateCount++;
      this.emit('cache_hit');
      
      try {
        return await entry.responsePromise;
      } catch (error) {
        // Remove failed entry
        this.cache.delete(hash);
        return null;
      }
    }

    return null;
  }

  private generateRequestHash(request: BatchRequest): string {
    return `${request.method}:${request.endpoint}:${JSON.stringify(request.params)}`;
  }
}