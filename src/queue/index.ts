/**
 * Queue System - Main Export
 * 
 * Enterprise-grade offline queue system with comprehensive fault tolerance
 * and error recovery capabilities for the Autotask SDK.
 */

// Core components
export { QueueManager, QueueManagerOptions } from './core/QueueManager';

// Storage backends
export { MemoryBackend } from './backends/MemoryBackend';
export { SQLiteBackend } from './backends/SQLiteBackend';
export { RedisBackend } from './backends/RedisBackend';

// Strategy components
export { PriorityScheduler } from './strategies/PriorityScheduler';
export { CircuitBreakerManager } from './strategies/CircuitBreakerManager';
export { BatchManager } from './strategies/BatchManager';

// Monitoring
export { QueueMonitor } from './monitoring/QueueMonitor';

// Types
export * from './types/QueueTypes';

// Utility functions
export {
  createQueueManager,
  createDefaultConfiguration,
  validateQueueConfiguration
} from './utils/QueueFactory';

/**
 * Re-export enhanced client with queue integration
 */
export { EnhancedAutotaskClient } from '../client/EnhancedAutotaskClient';