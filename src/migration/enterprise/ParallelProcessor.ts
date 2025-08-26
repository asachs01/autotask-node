/**
 * Parallel processor for enterprise scaling
 */

export interface ParallelProcessorOptions {
  maxConcurrency: number;
  batchSize: number;
}

export class ParallelProcessor {
  constructor(private options: ParallelProcessorOptions) {}

  async processInParallel<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.options.maxConcurrency) {
      const batch = items.slice(i, i + this.options.maxConcurrency);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  }
}