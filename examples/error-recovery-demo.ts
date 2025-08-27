/**
 * Error Recovery and Offline Queue System Demo
 * 
 * Comprehensive demonstration of the bulletproof queue system with:
 * - Offline queue management with persistence
 * - Intelligent error recovery and circuit breakers
 * - Request prioritization and batching
 * - Real-time monitoring and alerting
 * - Graceful degradation under load
 */

import winston from 'winston';
import { 
  QueueManager, 
  QuickSetup,
  createProductionConfiguration,
  QueueProcessor 
} from '../src/queue';
import { AutotaskClient } from '../src/client';

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: './logs/error-recovery-demo.log' 
    })
  ]
});

/**
 * Mock Autotask Client with controllable failures
 */
class MockAutotaskClient {
  private failureRate = 0;
  private latencyMs = 100;
  private isOffline = false;
  private requestCount = 0;
  
  setFailureRate(rate: number) {
    this.failureRate = Math.max(0, Math.min(1, rate));
    logger.info(`Set failure rate to ${(rate * 100).toFixed(1)}%`);
  }
  
  setLatency(ms: number) {
    this.latencyMs = Math.max(0, ms);
    logger.info(`Set latency to ${ms}ms`);
  }
  
  setOffline(offline: boolean) {
    this.isOffline = offline;
    logger.info(`Set offline mode: ${offline}`);
  }
  
  async get(endpoint: string): Promise<any> {
    return this.makeRequest('GET', endpoint);
  }
  
  async post(endpoint: string, data: any): Promise<any> {
    return this.makeRequest('POST', endpoint, data);
  }
  
  async put(endpoint: string, data: any): Promise<any> {
    return this.makeRequest('PUT', endpoint, data);
  }
  
  async delete(endpoint: string): Promise<any> {
    return this.makeRequest('DELETE', endpoint);
  }
  
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    this.requestCount++;
    
    if (this.isOffline) {
      throw new Error('Network offline - service unavailable');
    }
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, this.latencyMs));
    
    // Simulate random failures
    if (Math.random() < this.failureRate) {
      const errorTypes = [
        'Rate limit exceeded',
        'Service temporarily unavailable',
        'Connection timeout',
        'Internal server error',
        'Zone detection failed'
      ];
      
      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      throw new Error(`API Error: ${errorType}`);
    }
    
    // Simulate successful response
    return {
      success: true,
      method,
      endpoint,
      data,
      requestId: `req_${this.requestCount}`,
      timestamp: new Date().toISOString()
    };
  }
  
  getRequestCount(): number {
    return this.requestCount;
  }
}

/**
 * Enhanced Autotask Processor with error recovery
 */
class EnhancedAutotaskProcessor implements QueueProcessor {
  private client: MockAutotaskClient;
  private circuitBreaker: Map<string, { failures: number; lastFailure: Date }> = new Map();
  
  constructor(client: MockAutotaskClient) {
    this.client = client;
  }
  
  async processRequest(request: any): Promise<any> {
    const zone = request.zone;
    
    // Check circuit breaker
    if (this.isCircuitOpen(zone)) {
      throw new Error(`Circuit breaker open for zone ${zone}`);
    }
    
    try {
      let result;
      
      switch (request.method) {
        case 'GET':
          result = await this.client.get(request.endpoint);
          break;
        case 'POST':
          result = await this.client.post(request.endpoint, request.data);
          break;
        case 'PUT':
          result = await this.client.put(request.endpoint, request.data);
          break;
        case 'DELETE':
          result = await this.client.delete(request.endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }
      
      // Reset circuit breaker on success
      this.resetCircuitBreaker(zone);
      
      return result;
      
    } catch (error) {
      // Record failure
      this.recordFailure(zone);
      throw error;
    }
  }
  
  async processBatch(batch: any): Promise<any[]> {
    logger.info(`Processing batch of ${batch.requests.length} requests`);
    
    const results = await Promise.allSettled(
      batch.requests.map((request: any) => this.processRequest(request))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : { error: result.reason.message }
    );
  }
  
  canProcess(request: any): boolean {
    return !this.isCircuitOpen(request.zone);
  }
  
  async getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message?: string }> {
    const openCircuits = Array.from(this.circuitBreaker.entries())
      .filter(([_, data]) => this.isZoneCircuitOpen(data))
      .length;
    
    if (openCircuits === 0) {
      return { status: 'healthy' };
    } else if (openCircuits < 3) {
      return { status: 'degraded', message: `${openCircuits} zones with open circuits` };
    } else {
      return { status: 'offline', message: 'Multiple zones offline' };
    }
  }
  
  private isCircuitOpen(zone: string): boolean {
    const circuitData = this.circuitBreaker.get(zone);
    return circuitData ? this.isZoneCircuitOpen(circuitData) : false;
  }
  
  private isZoneCircuitOpen(circuitData: { failures: number; lastFailure: Date }): boolean {
    const now = new Date();
    const timeSinceLastFailure = now.getTime() - circuitData.lastFailure.getTime();
    
    // Circuit opens after 5 failures and stays open for 60 seconds
    return circuitData.failures >= 5 && timeSinceLastFailure < 60000;
  }
  
  private recordFailure(zone: string): void {
    const current = this.circuitBreaker.get(zone) || { failures: 0, lastFailure: new Date() };
    current.failures++;
    current.lastFailure = new Date();
    this.circuitBreaker.set(zone, current);
  }
  
  private resetCircuitBreaker(zone: string): void {
    this.circuitBreaker.delete(zone);
  }
}

/**
 * Demo scenario runner
 */
class DemoScenarioRunner {
  private queueManager: QueueManager;
  private client: MockAutotaskClient;
  private processor: EnhancedAutotaskProcessor;
  private requestCounter = 0;
  private scenarioRunning = false;
  
  constructor(queueManager: QueueManager, client: MockAutotaskClient, processor: EnhancedAutotaskProcessor) {
    this.queueManager = queueManager;
    this.client = client;
    this.processor = processor;
    
    // Set up monitoring
    this.setupMonitoring();
  }
  
  private setupMonitoring(): void {
    // Monitor queue events
    this.queueManager.on('request.completed', (event) => {
      logger.info(`✅ Request completed: ${event.request.endpoint}`);
    });
    
    this.queueManager.on('request.failed', (event) => {
      logger.warn(`❌ Request failed: ${event.request.endpoint} - ${event.error?.message}`);
    });
    
    this.queueManager.on('request.retrying', (event) => {
      logger.info(`🔄 Retrying request: ${event.request.endpoint} (attempt ${event.request.retryCount})`);
    });
    
    this.queueManager.on('batch.created', (event) => {
      logger.info(`📦 Batch created: ${event.batch.requests.length} requests`);
    });
    
    // Periodic metrics reporting
    setInterval(async () => {
      if (this.scenarioRunning) {
        await this.reportMetrics();
      }
    }, 5000);
  }
  
  private async reportMetrics(): Promise<void> {
    const metrics = await this.queueManager.getMetrics();
    const health = await this.queueManager.getHealth();
    
    logger.info('📊 Queue Metrics:', {
      queued: metrics.queuedRequests,
      processing: metrics.processingRequests,
      completed: metrics.successfulRequests,
      failed: metrics.failedRequests,
      errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
      utilization: `${(metrics.queueUtilization * 100).toFixed(1)}%`,
      throughput: `${metrics.throughput.toFixed(2)} req/s`,
      health: health.status
    });
  }
  
  private async addRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    options: any = {}
  ): Promise<void> {
    this.requestCounter++;
    
    try {
      const result = await this.queueManager.enqueue(
        endpoint,
        method,
        options.zone || `zone${(this.requestCounter % 3) + 1}`,
        {
          priority: options.priority || Math.floor(Math.random() * 10) + 1,
          data: options.data,
          retryable: options.retryable !== false,
          batchable: options.batchable || false,
          metadata: {
            requestId: this.requestCounter,
            scenario: options.scenario || 'unknown'
          }
        }
      );
      
      logger.debug(`Request ${this.requestCounter} completed:`, result);
      
    } catch (error) {
      logger.error(`Request ${this.requestCounter} failed:`, error.message);
    }
  }
  
  /**
   * Scenario 1: Normal operation with mixed priorities
   */
  async runNormalOperationScenario(): Promise<void> {
    logger.info('🚀 Running Normal Operation Scenario');
    this.scenarioRunning = true;
    
    // Set normal conditions
    this.client.setFailureRate(0.05); // 5% failure rate
    this.client.setLatency(200); // 200ms latency
    this.client.setOffline(false);
    
    const endpoints = ['/Companies', '/Contacts', '/Tickets', '/Projects', '/TimeEntries'];
    
    // Add various requests with different priorities
    for (let i = 0; i < 20; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const priority = i < 5 ? 9 : i < 10 ? 7 : Math.floor(Math.random() * 5) + 1;
      
      await this.addRequest(endpoint, 'GET', {
        priority,
        scenario: 'normal-operation',
        batchable: Math.random() > 0.5
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 10000));
    this.scenarioRunning = false;
    
    logger.info('✅ Normal Operation Scenario completed');
  }
  
  /**
   * Scenario 2: High error rate triggering circuit breakers
   */
  async runErrorRecoveryScenario(): Promise<void> {
    logger.info('🔥 Running Error Recovery Scenario');
    this.scenarioRunning = true;
    
    // Introduce high failure rate
    this.client.setFailureRate(0.7); // 70% failure rate
    this.client.setLatency(500); // Increased latency
    
    // Add requests that will trigger circuit breakers
    for (let i = 0; i < 15; i++) {
      await this.addRequest('/Companies', 'GET', {
        zone: 'zone1',
        priority: 8,
        scenario: 'error-recovery'
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Wait for circuit breakers to open
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Improve conditions
    logger.info('🔧 Improving system conditions...');
    this.client.setFailureRate(0.1); // Reduce to 10%
    this.client.setLatency(150);
    
    // Wait for recovery
    await new Promise(resolve => setTimeout(resolve, 10000));
    this.scenarioRunning = false;
    
    logger.info('✅ Error Recovery Scenario completed');
  }
  
  /**
   * Scenario 3: Offline operation with queue persistence
   */
  async runOfflineOperationScenario(): Promise<void> {
    logger.info('📴 Running Offline Operation Scenario');
    this.scenarioRunning = true;
    
    // Go offline
    this.client.setOffline(true);
    
    logger.info('📴 System is now offline - queuing requests...');
    
    // Add requests while offline
    for (let i = 0; i < 10; i++) {
      await this.addRequest('/Tickets', 'POST', {
        priority: Math.floor(Math.random() * 5) + 6, // High priority
        data: { title: `Offline Ticket ${i}`, description: 'Created while offline' },
        scenario: 'offline-operation'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Come back online
    logger.info('🌐 System is back online - processing queued requests...');
    this.client.setOffline(false);
    this.client.setFailureRate(0.02); // Very low failure rate
    this.client.setLatency(100);
    
    // Wait for queue processing
    await new Promise(resolve => setTimeout(resolve, 8000));
    this.scenarioRunning = false;
    
    logger.info('✅ Offline Operation Scenario completed');
  }
  
  /**
   * Scenario 4: Load testing with batching
   */
  async runLoadTestingScenario(): Promise<void> {
    logger.info('🏋️ Running Load Testing Scenario');
    this.scenarioRunning = true;
    
    // Set optimal conditions for load testing
    this.client.setFailureRate(0.02);
    this.client.setLatency(50);
    this.client.setOffline(false);
    
    logger.info('📈 Generating high load with batching enabled...');
    
    // Generate high load
    const promises: Promise<void>[] = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        this.addRequest('/Companies', 'GET', {
          priority: Math.floor(Math.random() * 10) + 1,
          batchable: true,
          scenario: 'load-testing'
        })
      );
    }
    
    // Add them all at once to test batching
    await Promise.all(promises);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 15000));
    this.scenarioRunning = false;
    
    logger.info('✅ Load Testing Scenario completed');
  }
  
  /**
   * Scenario 5: Graceful degradation under stress
   */
  async runGracefulDegradationScenario(): Promise<void> {
    logger.info('⚡ Running Graceful Degradation Scenario');
    this.scenarioRunning = true;
    
    // Stress conditions
    this.client.setFailureRate(0.3); // 30% failure rate
    this.client.setLatency(1000); // High latency
    
    logger.info('🔥 Applying stress conditions...');
    
    // Mix of high and low priority requests
    for (let i = 0; i < 50; i++) {
      const priority = i < 10 ? 10 : i < 20 ? 8 : Math.floor(Math.random() * 5) + 1;
      
      await this.addRequest(`/endpoint${i % 5}`, 'GET', {
        priority,
        zone: `zone${(i % 4) + 1}`,
        scenario: 'graceful-degradation'
      });
      
      // No delay to stress the system
    }
    
    // Monitor behavior under stress
    await new Promise(resolve => setTimeout(resolve, 20000));
    this.scenarioRunning = false;
    
    logger.info('✅ Graceful Degradation Scenario completed');
  }
  
  async runAllScenarios(): Promise<void> {
    logger.info('🎭 Starting comprehensive demo scenarios...');
    
    await this.runNormalOperationScenario();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.runErrorRecoveryScenario();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.runOfflineOperationScenario();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.runLoadTestingScenario();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.runGracefulDegradationScenario();
    
    // Final metrics report
    await this.generateFinalReport();
  }
  
  private async generateFinalReport(): Promise<void> {
    logger.info('📋 Generating final demo report...');
    
    const metrics = await this.queueManager.getMetrics();
    const health = await this.queueManager.getHealth();
    
    const report = {
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      failedRequests: metrics.failedRequests,
      successRate: `${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`,
      averageProcessingTime: `${metrics.averageProcessingTime.toFixed(0)}ms`,
      averageQueueTime: `${metrics.averageQueueTime.toFixed(0)}ms`,
      peakUtilization: `${(metrics.queueUtilization * 100).toFixed(1)}%`,
      throughput: `${metrics.throughput.toFixed(2)} req/s`,
      systemHealth: health.status,
      clientRequests: this.client.getRequestCount()
    };
    
    logger.info('📊 Final Demo Report:', report);
  }
}

/**
 * Main demo function
 */
async function runErrorRecoveryDemo(): Promise<void> {
  logger.info('🚀 Starting Error Recovery and Offline Queue Demo');
  
  try {
    // Create production-like queue configuration
    const config = createProductionConfiguration({
      maxSize: 5000,
      maxConcurrency: 15,
      batchingEnabled: true,
      maxBatchSize: 25,
      batchTimeout: 800,
      persistence: {
        backend: 'sqlite',
        connection: {
          dbPath: './demo-queue.db'
        },
        options: {
          checkpoints: true,
          checkpointInterval: 10000,
          compression: true,
          retentionPeriod: 3600000 // 1 hour for demo
        }
      }
    });
    
    // Initialize components
    const queueManager = new QueueManager({ config, logger });
    const mockClient = new MockAutotaskClient();
    const processor = new EnhancedAutotaskProcessor(mockClient);
    
    // Register processor
    (queueManager as any).processors.set('default', processor);
    
    // Initialize queue
    await queueManager.initialize();
    
    logger.info('✅ Queue system initialized successfully');
    
    // Create and run demo scenarios
    const demoRunner = new DemoScenarioRunner(queueManager, mockClient, processor);
    await demoRunner.runAllScenarios();
    
    logger.info('🎉 All demo scenarios completed successfully!');
    
    // Shutdown
    await queueManager.shutdown();
    
  } catch (error) {
    logger.error('❌ Demo failed:', error);
    throw error;
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runErrorRecoveryDemo()
    .then(() => {
      logger.info('✅ Error Recovery Demo completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Error Recovery Demo failed:', error);
      process.exit(1);
    });
}

export {
  runErrorRecoveryDemo,
  DemoScenarioRunner,
  EnhancedAutotaskProcessor,
  MockAutotaskClient
};