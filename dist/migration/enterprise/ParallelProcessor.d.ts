/**
 * Parallel processor for enterprise scaling
 */
export interface ParallelProcessorOptions {
    maxConcurrency: number;
    batchSize: number;
}
export declare class ParallelProcessor {
    private options;
    constructor(options: ParallelProcessorOptions);
    processInParallel<T, R>(items: T[], processor: (item: T) => Promise<R>): Promise<R[]>;
}
//# sourceMappingURL=ParallelProcessor.d.ts.map