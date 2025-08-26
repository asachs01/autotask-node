/**
 * Delivery manager ensuring reliable event delivery with various guarantees
 */

import winston from 'winston';
import { EventEmitter } from 'events';
import Bull, { Queue, Job } from 'bull';
import Redis from 'ioredis';
import {
  WebhookEvent,
  WebhookHandler,
  WebhookHandlerResult,
  DeliveryOptions,
  RetryPolicy,
} from '../types/WebhookTypes';

export interface DeliveryManagerConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  defaultDeliveryOptions: DeliveryOptions;
  queuePrefix: string;
  enableMetrics: boolean;
  cleanupInterval: number; // milliseconds
  maxJobAge: number; // milliseconds
}

export interface DeliveryMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  retryingJobs: number;
  deadLetterJobs: number;
  averageProcessingTime: number;
  lastProcessedAt?: Date;
}

export interface DeliveryJob {
  id: string;
  event: WebhookEvent;
  handler: WebhookHandler;
  options: DeliveryOptions;
  attempt: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: WebhookHandlerResult;
}

export class DeliveryManager extends EventEmitter {
  private config: DeliveryManagerConfig;
  private logger: winston.Logger;
  private redis: Redis;
  private mainQueue: Queue;
  private retryQueue: Queue;
  private deadLetterQueue: Queue;
  private metrics: DeliveryMetrics;
  private idempotencyCache: Map<string, boolean> = new Map();
  private cleanupTimer?: ReturnType<typeof setTimeout>;

  constructor(config: DeliveryManagerConfig, logger?: winston.Logger) {
    super();

    this.config = config;
    this.logger = logger || this.createDefaultLogger();
    this.metrics = this.initializeMetrics();

    this.setupRedis();
    this.setupQueues();
    this.setupCleanup();
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'delivery-manager' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  private initializeMetrics(): DeliveryMetrics {
    return {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      retryingJobs: 0,
      deadLetterJobs: 0,
      averageProcessingTime: 0,
    };
  }

  private setupRedis(): void {
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('error', error => {
      this.logger.error('Redis connection error', { error: error.message });
      this.emit('error', error);
    });

    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis');
    });
  }

  private setupQueues(): void {
    const redisConfig = {
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db || 0,
    };

    // Main processing queue
    this.mainQueue = new Bull(`${this.config.queuePrefix}:main`, {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 1, // Handled by our retry mechanism
      },
    });

    // Retry queue for failed jobs
    this.retryQueue = new Bull(`${this.config.queuePrefix}:retry`, {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 1,
      },
    });

    // Dead letter queue for permanently failed jobs
    this.deadLetterQueue = new Bull(`${this.config.queuePrefix}:dlq`, {
      redis: redisConfig,
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: false,
      },
    });

    this.setupQueueProcessors();
    this.setupQueueEventHandlers();
  }

  private setupQueueProcessors(): void {
    // Main queue processor
    this.mainQueue.process('deliver', async (job: Job<DeliveryJob>) => {
      return this.processDelivery(job.data);
    });

    // Retry queue processor
    this.retryQueue.process('retry', async (job: Job<DeliveryJob>) => {
      return this.processRetry(job.data);
    });

    // Dead letter queue processor (for manual intervention)
    this.deadLetterQueue.process('manual', async (job: Job<DeliveryJob>) => {
      return this.processManualIntervention(job.data);
    });
  }

  private setupQueueEventHandlers(): void {
    // Main queue events
    this.mainQueue.on('completed', (job: Job<DeliveryJob>) => {
      if (this.config.enableMetrics) {
        this.metrics.completedJobs++;
        this.updateAverageProcessingTime(
          Date.now() - job.data.createdAt.getTime()
        );
      }

      this.logger.debug('Job completed', {
        jobId: job.id,
        eventId: job.data.event.id,
        handlerName: job.data.handler.name,
      });

      this.emit('job:completed', job.data);
    });

    this.mainQueue.on('failed', (job: Job<DeliveryJob>, error: Error) => {
      if (this.config.enableMetrics) {
        this.metrics.failedJobs++;
      }

      this.logger.warn('Job failed', {
        jobId: job.id,
        eventId: job.data.event.id,
        handlerName: job.data.handler.name,
        error: error.message,
        attempt: job.data.attempt,
      });

      this.emit('job:failed', job.data, error);
    });

    // Similar event handlers for retry and dead letter queues
    this.retryQueue.on('completed', (job: Job<DeliveryJob>) => {
      this.emit('job:retry:completed', job.data);
    });

    this.retryQueue.on('failed', (job: Job<DeliveryJob>, error: Error) => {
      this.emit('job:retry:failed', job.data, error);
    });

    this.deadLetterQueue.on('completed', (job: Job<DeliveryJob>) => {
      this.emit('job:dlq:completed', job.data);
    });
  }

  private setupCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(error => {
        this.logger.error('Cleanup error', { error: error.message });
      });
    }, this.config.cleanupInterval);
  }

  // Public delivery methods
  public async deliver(
    event: WebhookEvent,
    handler: WebhookHandler,
    options?: Partial<DeliveryOptions>
  ): Promise<string> {
    const deliveryOptions = {
      ...this.config.defaultDeliveryOptions,
      ...options,
    };

    // Create delivery job
    const job: DeliveryJob = {
      id: this.generateJobId(),
      event,
      handler,
      options: deliveryOptions,
      attempt: 1,
      maxAttempts: deliveryOptions.retryPolicy.maxAttempts,
      createdAt: new Date(),
    };

    // Check for exactly-once delivery
    if (deliveryOptions.mode === 'exactly_once') {
      const idempotencyKey = this.generateIdempotencyKey(event, handler);
      if (this.idempotencyCache.has(idempotencyKey)) {
        this.logger.debug('Duplicate delivery prevented', {
          eventId: event.id,
          handlerName: handler.name,
          idempotencyKey,
        });
        return job.id;
      }
      this.idempotencyCache.set(idempotencyKey, true);
    }

    // Add to queue
    await this.mainQueue.add('deliver', job, {
      delay: 0,
      priority: handler.priority || 0,
    });

    if (this.config.enableMetrics) {
      this.metrics.totalJobs++;
    }

    this.logger.info('Delivery job queued', {
      jobId: job.id,
      eventId: event.id,
      handlerName: handler.name,
      deliveryMode: deliveryOptions.mode,
    });

    return job.id;
  }

  private async processDelivery(
    job: DeliveryJob
  ): Promise<WebhookHandlerResult> {
    const startTime = Date.now();
    job.processedAt = new Date();

    try {
      this.logger.debug('Processing delivery', {
        jobId: job.id,
        eventId: job.event.id,
        handlerName: job.handler.name,
        attempt: job.attempt,
      });

      // Execute handler with timeout
      const result = await this.executeWithTimeout(
        job.handler.handle(job.event),
        job.options.timeout || 30000
      );

      job.result = result;
      job.completedAt = new Date();

      if (result.success) {
        this.logger.debug('Delivery successful', {
          jobId: job.id,
          eventId: job.event.id,
          processingTime: Date.now() - startTime,
        });

        // Update metrics
        if (this.config.enableMetrics) {
          this.metrics.lastProcessedAt = new Date();
        }

        return result;
      } else {
        // Handler returned failure - decide on retry
        throw new Error(
          result.errors?.[0]?.message || 'Handler returned failure'
        );
      }
    } catch (error) {
      job.error = error instanceof Error ? error.message : String(error);

      this.logger.warn('Delivery failed', {
        jobId: job.id,
        eventId: job.event.id,
        error: job.error,
        attempt: job.attempt,
        processingTime: Date.now() - startTime,
      });

      // Handle retry logic
      await this.handleDeliveryFailure(job, error as Error);

      throw error;
    }
  }

  private async handleDeliveryFailure(
    job: DeliveryJob,
    error: Error
  ): Promise<void> {
    // Check if we should retry
    if (
      job.attempt < job.maxAttempts &&
      this.shouldRetry(error, job.options.retryPolicy)
    ) {
      await this.scheduleRetry(job, error);
    } else {
      // Send to dead letter queue
      await this.sendToDeadLetterQueue(job, error);
    }
  }

  private shouldRetry(error: Error, retryPolicy: RetryPolicy): boolean {
    // Check if error is retryable
    if (retryPolicy.retryableErrors && retryPolicy.retryableErrors.length > 0) {
      return retryPolicy.retryableErrors.some(pattern =>
        error.message.includes(pattern)
      );
    }

    // Default: retry all errors except specific non-retryable ones
    const nonRetryablePatterns = [
      'Invalid signature',
      'Authentication failed',
      'Forbidden',
      'Not found',
      'Bad request',
    ];

    return !nonRetryablePatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private async scheduleRetry(job: DeliveryJob, error: Error): Promise<void> {
    const retryPolicy = job.options.retryPolicy;
    const delay = this.calculateRetryDelay(job.attempt, retryPolicy);

    job.attempt++;
    job.scheduledAt = new Date(Date.now() + delay);
    job.error = error.message;

    await this.retryQueue.add('retry', job, {
      delay,
      priority: job.handler.priority || 0,
    });

    if (this.config.enableMetrics) {
      this.metrics.retryingJobs++;
    }

    this.logger.info('Retry scheduled', {
      jobId: job.id,
      eventId: job.event.id,
      attempt: job.attempt,
      maxAttempts: job.maxAttempts,
      delay,
    });
  }

  private calculateRetryDelay(
    attempt: number,
    retryPolicy: RetryPolicy
  ): number {
    let delay =
      retryPolicy.initialDelayMs *
      Math.pow(retryPolicy.backoffMultiplier, attempt - 1);

    // Apply max delay limit
    delay = Math.min(delay, retryPolicy.maxDelayMs);

    // Add jitter if configured
    if (retryPolicy.jitterMs) {
      delay += Math.random() * retryPolicy.jitterMs;
    }

    return Math.floor(delay);
  }

  private async processRetry(job: DeliveryJob): Promise<WebhookHandlerResult> {
    this.logger.debug('Processing retry', {
      jobId: job.id,
      eventId: job.event.id,
      attempt: job.attempt,
    });

    // Move back to main queue for processing
    return this.processDelivery(job);
  }

  private async sendToDeadLetterQueue(
    job: DeliveryJob,
    error: Error
  ): Promise<void> {
    job.error = error.message;
    job.completedAt = new Date();

    await this.deadLetterQueue.add('manual', job, {
      priority: job.handler.priority || 0,
    });

    if (this.config.enableMetrics) {
      this.metrics.deadLetterJobs++;
    }

    this.logger.error('Job sent to dead letter queue', {
      jobId: job.id,
      eventId: job.event.id,
      handlerName: job.handler.name,
      finalError: error.message,
      totalAttempts: job.attempt,
    });

    this.emit('job:dead_letter', job);
  }

  private async processManualIntervention(job: DeliveryJob): Promise<void> {
    // This is typically used for manual reprocessing
    // For now, just log the job details
    this.logger.info('Manual intervention required', {
      jobId: job.id,
      eventId: job.event.id,
      handlerName: job.handler.name,
      error: job.error,
    });
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error('Handler execution timeout')),
          timeoutMs
        )
      ),
    ]);
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIdempotencyKey(
    event: WebhookEvent,
    handler: WebhookHandler
  ): string {
    return `${event.id}:${handler.id}:${event.timestamp.getTime()}`;
  }

  private updateAverageProcessingTime(processingTime: number): void {
    const totalTime =
      this.metrics.averageProcessingTime * (this.metrics.completedJobs - 1) +
      processingTime;
    this.metrics.averageProcessingTime = totalTime / this.metrics.completedJobs;
  }

  // Cleanup methods
  private async cleanup(): Promise<void> {
    const cutoffTime = Date.now() - this.config.maxJobAge;

    try {
      // Clean up old completed jobs
      await this.mainQueue.clean(cutoffTime, 'completed');
      await this.retryQueue.clean(cutoffTime, 'completed');

      // Clean up old failed jobs (keep them longer)
      await this.mainQueue.clean(cutoffTime * 2, 'failed');
      await this.retryQueue.clean(cutoffTime * 2, 'failed');

      // Clean up idempotency cache (simple implementation)
      if (this.idempotencyCache.size > 10000) {
        this.idempotencyCache.clear();
      }

      this.logger.debug('Cleanup completed', {
        cutoffTime: new Date(cutoffTime),
        cacheSize: this.idempotencyCache.size,
      });
    } catch (error) {
      this.logger.error('Cleanup failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Public management methods
  public async getJobStatus(jobId: string): Promise<DeliveryJob | null> {
    // Try to find job in any queue
    const mainJob = await this.mainQueue.getJob(jobId);
    if (mainJob) {
      return mainJob.data;
    }

    const retryJob = await this.retryQueue.getJob(jobId);
    if (retryJob) {
      return retryJob.data;
    }

    const dlqJob = await this.deadLetterQueue.getJob(jobId);
    if (dlqJob) {
      return dlqJob.data;
    }

    return null;
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    try {
      // Try to cancel in all queues
      let cancelled = false;

      const mainJob = await this.mainQueue.getJob(jobId);
      if (mainJob) {
        await mainJob.remove();
        cancelled = true;
      }

      const retryJob = await this.retryQueue.getJob(jobId);
      if (retryJob) {
        await retryJob.remove();
        cancelled = true;
      }

      return cancelled;
    } catch (error) {
      this.logger.error('Error cancelling job', {
        jobId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  public async retryDeadLetterJob(jobId: string): Promise<boolean> {
    try {
      const dlqJob = await this.deadLetterQueue.getJob(jobId);
      if (!dlqJob) {
        return false;
      }

      const job = dlqJob.data;
      job.attempt = 1; // Reset attempt count
      job.error = undefined;

      await this.mainQueue.add('deliver', job);
      await dlqJob.remove();

      this.logger.info('Dead letter job requeued', { jobId });
      return true;
    } catch (error) {
      this.logger.error('Error retrying dead letter job', {
        jobId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  public getMetrics(): DeliveryMetrics {
    return { ...this.metrics };
  }

  public async getQueueStats(): Promise<{
    main: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    retry: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    dlq: { waiting: number; active: number; completed: number; failed: number };
  }> {
    const [mainStats, retryStats, dlqStats] = await Promise.all([
      this.mainQueue.getWaiting(),
      this.retryQueue.getWaiting(),
      this.deadLetterQueue.getWaiting(),
    ]);

    return {
      main: {
        waiting: mainStats.length,
        active: await this.mainQueue.getActive().then(jobs => jobs.length),
        completed: await this.mainQueue
          .getCompleted()
          .then(jobs => jobs.length),
        failed: await this.mainQueue.getFailed().then(jobs => jobs.length),
      },
      retry: {
        waiting: retryStats.length,
        active: await this.retryQueue.getActive().then(jobs => jobs.length),
        completed: await this.retryQueue
          .getCompleted()
          .then(jobs => jobs.length),
        failed: await this.retryQueue.getFailed().then(jobs => jobs.length),
      },
      dlq: {
        waiting: dlqStats.length,
        active: await this.deadLetterQueue
          .getActive()
          .then(jobs => jobs.length),
        completed: await this.deadLetterQueue
          .getCompleted()
          .then(jobs => jobs.length),
        failed: await this.deadLetterQueue
          .getFailed()
          .then(jobs => jobs.length),
      },
    };
  }

  // Shutdown methods
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down delivery manager');

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    await Promise.all([
      this.mainQueue.close(),
      this.retryQueue.close(),
      this.deadLetterQueue.close(),
    ]);

    await this.redis.quit();

    this.logger.info('Delivery manager shutdown complete');
  }
}
