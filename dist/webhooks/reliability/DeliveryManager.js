"use strict";
/**
 * Delivery manager ensuring reliable event delivery with various guarantees
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryManager = void 0;
const winston_1 = __importDefault(require("winston"));
const events_1 = require("events");
const bull_1 = __importDefault(require("bull"));
const ioredis_1 = __importDefault(require("ioredis"));
class DeliveryManager extends events_1.EventEmitter {
    constructor(config, logger) {
        super();
        this.idempotencyCache = new Map();
        this.config = config;
        this.logger = logger || this.createDefaultLogger();
        this.metrics = this.initializeMetrics();
        this.setupRedis();
        this.setupQueues();
        this.setupCleanup();
    }
    createDefaultLogger() {
        return winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'delivery-manager' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ],
        });
    }
    initializeMetrics() {
        return {
            totalJobs: 0,
            completedJobs: 0,
            failedJobs: 0,
            retryingJobs: 0,
            deadLetterJobs: 0,
            averageProcessingTime: 0,
        };
    }
    setupRedis() {
        this.redis = new ioredis_1.default({
            host: this.config.redis.host,
            port: this.config.redis.port,
            password: this.config.redis.password,
            db: this.config.redis.db || 0,
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
    setupQueues() {
        const redisConfig = {
            host: this.config.redis.host,
            port: this.config.redis.port,
            password: this.config.redis.password,
            db: this.config.redis.db || 0,
        };
        // Main processing queue
        this.mainQueue = new bull_1.default(`${this.config.queuePrefix}:main`, {
            redis: redisConfig,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 1, // Handled by our retry mechanism
            },
        });
        // Retry queue for failed jobs
        this.retryQueue = new bull_1.default(`${this.config.queuePrefix}:retry`, {
            redis: redisConfig,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 1,
            },
        });
        // Dead letter queue for permanently failed jobs
        this.deadLetterQueue = new bull_1.default(`${this.config.queuePrefix}:dlq`, {
            redis: redisConfig,
            defaultJobOptions: {
                removeOnComplete: 1000,
                removeOnFail: false,
            },
        });
        this.setupQueueProcessors();
        this.setupQueueEventHandlers();
    }
    setupQueueProcessors() {
        // Main queue processor
        this.mainQueue.process('deliver', async (job) => {
            return this.processDelivery(job.data);
        });
        // Retry queue processor
        this.retryQueue.process('retry', async (job) => {
            return this.processRetry(job.data);
        });
        // Dead letter queue processor (for manual intervention)
        this.deadLetterQueue.process('manual', async (job) => {
            return this.processManualIntervention(job.data);
        });
    }
    setupQueueEventHandlers() {
        // Main queue events
        this.mainQueue.on('completed', (job) => {
            if (this.config.enableMetrics) {
                this.metrics.completedJobs++;
                this.updateAverageProcessingTime(Date.now() - job.data.createdAt.getTime());
            }
            this.logger.debug('Job completed', {
                jobId: job.id,
                eventId: job.data.event.id,
                handlerName: job.data.handler.name,
            });
            this.emit('job:completed', job.data);
        });
        this.mainQueue.on('failed', (job, error) => {
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
        this.retryQueue.on('completed', (job) => {
            this.emit('job:retry:completed', job.data);
        });
        this.retryQueue.on('failed', (job, error) => {
            this.emit('job:retry:failed', job.data, error);
        });
        this.deadLetterQueue.on('completed', (job) => {
            this.emit('job:dlq:completed', job.data);
        });
    }
    setupCleanup() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup().catch(error => {
                this.logger.error('Cleanup error', { error: error.message });
            });
        }, this.config.cleanupInterval);
    }
    // Public delivery methods
    async deliver(event, handler, options) {
        const deliveryOptions = {
            ...this.config.defaultDeliveryOptions,
            ...options,
        };
        // Create delivery job
        const job = {
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
    async processDelivery(job) {
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
            const result = await this.executeWithTimeout(job.handler.handle(job.event), job.options.timeout || 30000);
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
            }
            else {
                // Handler returned failure - decide on retry
                throw new Error(result.errors?.[0]?.message || 'Handler returned failure');
            }
        }
        catch (error) {
            job.error = error instanceof Error ? error.message : String(error);
            this.logger.warn('Delivery failed', {
                jobId: job.id,
                eventId: job.event.id,
                error: job.error,
                attempt: job.attempt,
                processingTime: Date.now() - startTime,
            });
            // Handle retry logic
            await this.handleDeliveryFailure(job, error);
            throw error;
        }
    }
    async handleDeliveryFailure(job, error) {
        // Check if we should retry
        if (job.attempt < job.maxAttempts &&
            this.shouldRetry(error, job.options.retryPolicy)) {
            await this.scheduleRetry(job, error);
        }
        else {
            // Send to dead letter queue
            await this.sendToDeadLetterQueue(job, error);
        }
    }
    shouldRetry(error, retryPolicy) {
        // Check if error is retryable
        if (retryPolicy.retryableErrors && retryPolicy.retryableErrors.length > 0) {
            return retryPolicy.retryableErrors.some(pattern => error.message.includes(pattern));
        }
        // Default: retry all errors except specific non-retryable ones
        const nonRetryablePatterns = [
            'Invalid signature',
            'Authentication failed',
            'Forbidden',
            'Not found',
            'Bad request',
        ];
        return !nonRetryablePatterns.some(pattern => error.message.toLowerCase().includes(pattern.toLowerCase()));
    }
    async scheduleRetry(job, error) {
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
    calculateRetryDelay(attempt, retryPolicy) {
        let delay = retryPolicy.initialDelayMs *
            Math.pow(retryPolicy.backoffMultiplier, attempt - 1);
        // Apply max delay limit
        delay = Math.min(delay, retryPolicy.maxDelayMs);
        // Add jitter if configured
        if (retryPolicy.jitterMs) {
            delay += Math.random() * retryPolicy.jitterMs;
        }
        return Math.floor(delay);
    }
    async processRetry(job) {
        this.logger.debug('Processing retry', {
            jobId: job.id,
            eventId: job.event.id,
            attempt: job.attempt,
        });
        // Move back to main queue for processing
        return this.processDelivery(job);
    }
    async sendToDeadLetterQueue(job, error) {
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
    async processManualIntervention(job) {
        // This is typically used for manual reprocessing
        // For now, just log the job details
        this.logger.info('Manual intervention required', {
            jobId: job.id,
            eventId: job.event.id,
            handlerName: job.handler.name,
            error: job.error,
        });
    }
    async executeWithTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Handler execution timeout')), timeoutMs)),
        ]);
    }
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateIdempotencyKey(event, handler) {
        return `${event.id}:${handler.id}:${event.timestamp.getTime()}`;
    }
    updateAverageProcessingTime(processingTime) {
        const totalTime = this.metrics.averageProcessingTime * (this.metrics.completedJobs - 1) +
            processingTime;
        this.metrics.averageProcessingTime = totalTime / this.metrics.completedJobs;
    }
    // Cleanup methods
    async cleanup() {
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
        }
        catch (error) {
            this.logger.error('Cleanup failed', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    // Public management methods
    async getJobStatus(jobId) {
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
    async cancelJob(jobId) {
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
        }
        catch (error) {
            this.logger.error('Error cancelling job', {
                jobId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
    async retryDeadLetterJob(jobId) {
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
        }
        catch (error) {
            this.logger.error('Error retrying dead letter job', {
                jobId,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async getQueueStats() {
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
    async shutdown() {
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
exports.DeliveryManager = DeliveryManager;
//# sourceMappingURL=DeliveryManager.js.map