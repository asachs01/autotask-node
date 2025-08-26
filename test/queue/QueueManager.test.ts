/**
 * Queue Manager Tests
 * 
 * Comprehensive test suite for the queue management system
 */

import { QueueManager } from '../../src/queue/core/QueueManager';
import { QuickSetup, createTestConfiguration } from '../../src/queue/utils/QueueFactory';
import { QueueRequest, QueueProcessor, QueueBatch } from '../../src/queue/types/QueueTypes';
import winston from 'winston';

// Create silent logger for tests
const logger = winston.createLogger({
  level: 'error',
  transports: [new winston.transports.Console({ silent: true })]
});

// Mock processor for testing
class MockProcessor implements QueueProcessor {
  async processRequest(request: QueueRequest): Promise<any> {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 10));
    return { success: true, requestId: request.id };
  }

  async processBatch(batch: QueueBatch): Promise<any[]> {
    return Promise.all(batch.requests.map(req => this.processRequest(req)));
  }

  canProcess(request: QueueRequest): boolean {
    return true;
  }

  async getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message?: string }> {
    return { status: 'healthy' };
  }
}

describe('QueueManager', () => {
  let queueManager: QueueManager;
  let mockProcessor: MockProcessor;
  
  beforeEach(async () => {
    queueManager = await QuickSetup.memory(logger);
    mockProcessor = new MockProcessor();
    
    // Register processors for common endpoints used in tests
    queueManager.registerProcessor('/Companies', mockProcessor);
    queueManager.registerProcessor('/endpoint1', mockProcessor);
    queueManager.registerProcessor('/endpoint2', mockProcessor);
    queueManager.registerProcessor('/slow-endpoint', mockProcessor);
    queueManager.registerProcessor('/test', mockProcessor);
    queueManager.registerProcessor('/test1', mockProcessor);
    queueManager.registerProcessor('/test2', mockProcessor);
    queueManager.registerProcessor('/companies', mockProcessor);
    queueManager.registerProcessor('default', mockProcessor);
  });
  
  afterEach(async () => {
    if (queueManager) {
      await queueManager.shutdown();
    }
  });
  
  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      expect(queueManager).toBeInstanceOf(QueueManager);
    });
    
    test('should have default configuration', async () => {
      const health = await queueManager.getHealth();
      expect(health.status).toBeDefined();
    });
  });
  
  describe('Request Enqueuing', () => {
    test('should enqueue a simple request', async () => {
      const requestPromise = queueManager.enqueue(
        '/Companies',
        'GET',
        'zone1',
        { priority: 5 }
      );
      
      expect(requestPromise).toBeInstanceOf(Promise);
      
      // Wait a moment for the request to be processed
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const metrics = await queueManager.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });
    
    test('should handle request with data', async () => {
      const requestData = { name: 'Test Company', type: 'Client' };
      
      const requestPromise = queueManager.enqueue(
        '/Companies',
        'POST',
        'zone1',
        { 
          data: requestData,
          priority: 7,
          metadata: { test: true }
        }
      );
      
      expect(requestPromise).toBeInstanceOf(Promise);
    });
    
    test('should respect priority ordering', async () => {
      // Enqueue requests with different priorities
      await queueManager.enqueue('/endpoint1', 'GET', 'zone1', { priority: 5 });
      await queueManager.enqueue('/endpoint2', 'GET', 'zone1', { priority: 8 });
      await queueManager.enqueue('/endpoint3', 'GET', 'zone1', { priority: 3 });
      
      const metrics = await queueManager.getMetrics();
      expect(metrics.queuedRequests).toBe(3);
      
      // Higher priority should be processed first
      const requests = await queueManager.getRequests({ 
        status: 'pending',
        sort: { field: 'priority', direction: 'desc' }
      });
      
      expect(requests[0].priority).toBe(8);
      expect(requests[1].priority).toBe(5);
      expect(requests[2].priority).toBe(3);
    });
  });
  
  describe('Request Processing', () => {
    test('should process requests', async () => {
      // Mock processor
      const mockProcessor = {
        processRequest: jest.fn().mockResolvedValue({ success: true }),
        processBatch: jest.fn(),
        canProcess: jest.fn().mockReturnValue(true),
        getHealth: jest.fn().mockResolvedValue({ status: 'healthy' })
      };
      
      // Add processor to queue manager
      (queueManager as any).processors.set('default', mockProcessor);
      
      const result = queueManager.enqueue('/test', 'GET', 'zone1');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const metrics = await queueManager.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });
    
    test('should handle request timeouts', async () => {
      const shortTimeout = 100;
      
      const requestPromise = queueManager.enqueue(
        '/slow-endpoint',
        'GET',
        'zone1',
        { timeout: shortTimeout }
      );
      
      await expect(requestPromise).rejects.toThrow(/timed out/);
    }, 1000);
  });
  
  describe('Request Cancellation', () => {
    test('should cancel pending requests', async () => {
      const requestPromise = queueManager.enqueue('/test', 'GET', 'zone1');
      
      // Get request ID (simplified for test)
      const requests = await queueManager.getRequests({ status: 'pending' });
      expect(requests.length).toBe(1);
      
      const cancelled = await queueManager.cancelRequest(requests[0].id);
      expect(cancelled).toBe(true);
      
      const updatedRequests = await queueManager.getRequests({ status: 'cancelled' });
      expect(updatedRequests.length).toBe(1);
    });
  });
  
  describe('Queue Management', () => {
    test('should get queue size', async () => {
      await queueManager.enqueue('/test1', 'GET', 'zone1');
      await queueManager.enqueue('/test2', 'GET', 'zone1');
      
      const requests = await queueManager.getRequests();
      expect(requests.length).toBe(2);
    });
    
    test('should clear queue', async () => {
      await queueManager.enqueue('/test1', 'GET', 'zone1');
      await queueManager.enqueue('/test2', 'GET', 'zone2');
      
      const clearedCount = await queueManager.clear();
      expect(clearedCount).toBe(2);
      
      const requests = await queueManager.getRequests();
      expect(requests.length).toBe(0);
    });
    
    test('should clear queue by zone', async () => {
      await queueManager.enqueue('/test1', 'GET', 'zone1');
      await queueManager.enqueue('/test2', 'GET', 'zone2');
      
      const clearedCount = await queueManager.clear('zone1');
      expect(clearedCount).toBe(1);
      
      const remainingRequests = await queueManager.getRequests();
      expect(remainingRequests.length).toBe(1);
      expect(remainingRequests[0].zone).toBe('zone2');
    });
  });
  
  describe('Metrics and Health', () => {
    test('should provide metrics', async () => {
      const metrics = await queueManager.getMetrics();
      
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('successfulRequests');
      expect(metrics).toHaveProperty('failedRequests');
      expect(metrics).toHaveProperty('queuedRequests');
      expect(metrics).toHaveProperty('processingRequests');
      expect(metrics).toHaveProperty('averageProcessingTime');
      expect(metrics).toHaveProperty('averageQueueTime');
      expect(metrics).toHaveProperty('queueUtilization');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('errorRate');
    });
    
    test('should provide health status', async () => {
      const health = await queueManager.getHealth();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('components');
      expect(health).toHaveProperty('performance');
      expect(health).toHaveProperty('resources');
      expect(health.status).toMatch(/healthy|degraded|critical|offline/);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle queue full condition', async () => {
      // Create queue with very small size
      const smallQueue = new QueueManager({
        config: createTestConfiguration({ maxSize: 2 }),
        logger
      });
      
      await smallQueue.initialize();
      
      try {
        // Fill queue
        await smallQueue.enqueue('/test1', 'GET', 'zone1');
        await smallQueue.enqueue('/test2', 'GET', 'zone1');
        
        // This should trigger queue full handling
        await expect(
          smallQueue.enqueue('/test3', 'GET', 'zone1')
        ).rejects.toThrow();
        
      } finally {
        await smallQueue.shutdown();
      }
    });
  });
  
  describe('Request Filtering', () => {
    beforeEach(async () => {
      // Add test data
      await queueManager.enqueue('/companies', 'GET', 'zone1', { priority: 5 });
      await queueManager.enqueue('/tickets', 'POST', 'zone2', { priority: 8 });
      await queueManager.enqueue('/contacts', 'GET', 'zone1', { priority: 3 });
    });
    
    test('should filter by status', async () => {
      const pendingRequests = await queueManager.getRequests({ 
        status: 'pending' 
      });
      
      expect(pendingRequests.length).toBe(3);
      expect(pendingRequests.every(req => req.status === 'pending')).toBe(true);
    });
    
    test('should filter by zone', async () => {
      const zone1Requests = await queueManager.getRequests({ 
        zone: 'zone1' 
      });
      
      expect(zone1Requests.length).toBe(2);
      expect(zone1Requests.every(req => req.zone === 'zone1')).toBe(true);
    });
    
    test('should filter by priority range', async () => {
      const highPriorityRequests = await queueManager.getRequests({ 
        priority: { min: 5 } 
      });
      
      expect(highPriorityRequests.length).toBe(2);
      expect(highPriorityRequests.every(req => req.priority >= 5)).toBe(true);
    });
    
    test('should sort and limit results', async () => {
      const sortedRequests = await queueManager.getRequests({
        sort: { field: 'priority', direction: 'desc' },
        limit: 2
      });
      
      expect(sortedRequests.length).toBe(2);
      expect(sortedRequests[0].priority).toBe(8);
      expect(sortedRequests[1].priority).toBe(5);
    });
  });
  
  describe('Pause and Resume', () => {
    test('should pause and resume processing', async () => {
      // Pause processing
      queueManager.pauseProcessing();
      
      // Add requests while paused
      await queueManager.enqueue('/test', 'GET', 'zone1');
      
      // Verify request is queued but not processed
      const metrics = await queueManager.getMetrics();
      expect(metrics.queuedRequests).toBeGreaterThan(0);
      
      // Resume processing
      queueManager.resumeProcessing();
      
      // Wait a bit for processing to happen
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify system is working
      const health = await queueManager.getHealth();
      expect(health.components.processor).toMatch(/healthy|degraded/);
    }, 15000);
  });
  
  describe('Configuration Validation', () => {
    test('should work with valid configuration', async () => {
      const validConfig = createTestConfiguration({
        maxSize: 1000,
        maxConcurrency: 5,
        batchingEnabled: true,
        maxBatchSize: 10
      });
      
      const manager = new QueueManager({
        config: validConfig,
        logger
      });
      
      await manager.initialize();
      await manager.shutdown();
    });
  });
  
  describe('Memory Management', () => {
    test('should handle large numbers of requests', async () => {
      const requestCount = 100;
      const promises: Promise<any>[] = [];
      
      // Add many requests
      for (let i = 0; i < requestCount; i++) {
        promises.push(
          queueManager.enqueue(`/test-${i}`, 'GET', `zone-${i % 3}`, {
            priority: Math.floor(Math.random() * 10) + 1
          })
        );
      }
      
      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const metrics = await queueManager.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });
  });
});

describe('Queue System Integration', () => {
  test('should work with different backends', async () => {
    // Test memory backend
    const memoryQueue = await QuickSetup.memory(logger);
    await memoryQueue.enqueue('/test', 'GET', 'zone1');
    
    const metrics = await memoryQueue.getMetrics();
    expect(metrics.queuedRequests).toBeGreaterThan(0);
    
    await memoryQueue.shutdown();
  });
  
  test('should maintain data consistency', async () => {
    const queue = await QuickSetup.memory(logger);
    
    // Add requests
    const requests = [
      queue.enqueue('/test1', 'GET', 'zone1', { priority: 5 }),
      queue.enqueue('/test2', 'GET', 'zone1', { priority: 8 }),
      queue.enqueue('/test3', 'GET', 'zone1', { priority: 3 })
    ];
    
    // Verify all requests are tracked
    const queuedRequests = await queue.getRequests({ status: 'pending' });
    expect(queuedRequests.length).toBe(3);
    
    // Verify priority ordering
    const sortedRequests = await queue.getRequests({
      status: 'pending',
      sort: { field: 'priority', direction: 'desc' }
    });
    
    expect(sortedRequests[0].priority).toBe(8);
    expect(sortedRequests[1].priority).toBe(5);
    expect(sortedRequests[2].priority).toBe(3);
    
    await queue.shutdown();
  });
});