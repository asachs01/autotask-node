# Advanced Queue System

Enterprise-grade offline queue system with comprehensive fault tolerance and error recovery capabilities for the Autotask SDK.

## 🚀 Features

### Core Queue Management
- **Multi-backend persistence** (Memory, SQLite, Redis)
- **Priority-based request scheduling** with adaptive strategies
- **Intelligent request batching** with dynamic sizing
- **Request deduplication** to prevent duplicate operations
- **Automatic request retry** with exponential backoff and jitter

### Error Recovery & Resilience
- **Circuit breaker patterns** with adaptive thresholds per zone
- **Intelligent error classification** and recovery strategies
- **Graceful degradation** under high load or system stress
- **Automatic failover** between healthy zones
- **Request replay** with state reconciliation

### Monitoring & Observability
- **Real-time metrics** collection and analysis
- **Performance trend analysis** with predictive alerts
- **Health monitoring** with automatic recovery
- **Capacity planning** and utilization forecasting
- **Comprehensive audit trails** for all operations

### Offline Operation
- **Persistent request queue** survives restarts and outages
- **Zone-aware processing** maintains service during partial outages
- **State synchronization** when connectivity is restored
- **Queue size management** with intelligent cleanup

## 📦 Installation

```bash
npm install @autotask/queue-system
```

## 🛠️ Quick Start

### Basic Usage

```typescript
import { QuickSetup } from '@autotask/queue-system';

// Create a basic memory queue
const queue = await QuickSetup.memory();

// Enqueue a request
const result = await queue.enqueue('/Companies', 'GET', 'zone1', {
  priority: 8,
  retryable: true
});

console.log('Request completed:', result);

// Shutdown gracefully
await queue.shutdown();
```

### Production SQLite Setup

```typescript
import { QuickSetup } from '@autotask/queue-system';

// Create production-ready SQLite queue
const queue = await QuickSetup.sqlite('./data/queue.db');

// Process high-priority requests first
await queue.enqueue('/Tickets', 'POST', 'zone1', {
  priority: 10,
  data: { title: 'Critical Issue', priority: 'Critical' },
  retryable: true,
  batchable: false
});
```

### Redis Distributed Setup

```typescript
import { QuickSetup } from '@autotask/queue-system';

// Create Redis-backed distributed queue
const queue = await QuickSetup.redis({
  host: 'localhost',
  port: 6379,
  password: 'your-redis-password'
});

// Add batchable requests for efficiency
await queue.enqueue('/Companies', 'GET', 'zone1', {
  priority: 5,
  batchable: true
});
```

## 🔧 Advanced Configuration

### Custom Configuration

```typescript
import { 
  QueueManager, 
  createProductionConfiguration 
} from '@autotask/queue-system';

const config = createProductionConfiguration({
  maxSize: 50000,
  maxConcurrency: 25,
  batchingEnabled: true,
  maxBatchSize: 30,
  persistence: {
    backend: 'sqlite',
    connection: { dbPath: './production-queue.db' },
    options: {
      checkpoints: true,
      compression: true,
      retentionPeriod: 604800000 // 7 days
    }
  },
  strategies: {
    priorityStrategy: 'adaptive',
    circuitBreaker: {
      enabled: true,
      failureThreshold: 3,
      successThreshold: 5,
      timeout: 30000
    }
  }
});

const queue = new QueueManager({ config });
await queue.initialize();
```

### Custom Processor

```typescript
import { QueueProcessor } from '@autotask/queue-system';

class AutotaskProcessor implements QueueProcessor {
  async processRequest(request: QueueRequest): Promise<any> {
    // Custom processing logic
    switch (request.method) {
      case 'GET':
        return await this.client.get(request.endpoint);
      case 'POST':
        return await this.client.post(request.endpoint, request.data);
      // ... handle other methods
    }
  }
  
  canProcess(request: QueueRequest): boolean {
    return request.endpoint.startsWith('/');
  }
  
  async getHealth(): Promise<{ status: string; message?: string }> {
    return { status: 'healthy' };
  }
}

// Register custom processor
const processor = new AutotaskProcessor();
queue.processors.set('autotask', processor);
```

## 📊 Monitoring & Metrics

### Real-time Metrics

```typescript
// Get current metrics
const metrics = await queue.getMetrics();
console.log({
  queuedRequests: metrics.queuedRequests,
  processingRequests: metrics.processingRequests,
  successRate: `${((1 - metrics.errorRate) * 100).toFixed(2)}%`,
  throughput: `${metrics.throughput.toFixed(2)} req/s`,
  utilization: `${(metrics.queueUtilization * 100).toFixed(1)}%`
});

// Get system health
const health = await queue.getHealth();
console.log('System status:', health.status);
```

### Event Monitoring

```typescript
// Monitor queue events
queue.on('request.completed', (event) => {
  console.log(`✅ Request completed: ${event.request.endpoint}`);
});

queue.on('request.failed', (event) => {
  console.log(`❌ Request failed: ${event.request.endpoint}`);
});

queue.on('circuit.opened', (event) => {
  console.log(`🔴 Circuit breaker opened for zone: ${event.zone}`);
});

queue.on('queue.full', () => {
  console.log('⚠️ Queue is at capacity');
});
```

## 🔄 Error Recovery

### Circuit Breaker Management

```typescript
// Check circuit breaker status
const breakers = queue.circuitBreaker.getAllMetrics();
breakers.forEach(breaker => {
  console.log(`Zone ${breaker.zone}: ${breaker.state.state}`);
});

// Manually control circuit breakers
await queue.circuitBreaker.forceOpen('zone1', 'Maintenance mode');
await queue.circuitBreaker.forceClose('zone1', 'Maintenance complete');
```

### Request Management

```typescript
// Get requests by status
const pendingRequests = await queue.getRequests({ 
  status: 'pending',
  priority: { min: 7 }
});

// Cancel specific requests
for (const request of pendingRequests) {
  if (request.metadata.cancelable) {
    await queue.cancelRequest(request.id);
  }
}

// Clear queue by zone
await queue.clear('zone1');
```

## 🔧 Configuration Options

### Queue Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSize` | number | 10000 | Maximum queue capacity |
| `maxConcurrency` | number | 10 | Max concurrent processors |
| `priorityEnabled` | boolean | true | Enable priority processing |
| `batchingEnabled` | boolean | true | Enable request batching |
| `maxBatchSize` | number | 10 | Maximum batch size |
| `batchTimeout` | number | 1000 | Batch collection timeout (ms) |
| `deduplicationEnabled` | boolean | true | Enable request deduplication |
| `defaultTimeout` | number | 300000 | Default request timeout (ms) |
| `defaultRetries` | number | 3 | Default retry attempts |

### Persistence Options

| Backend | Use Case | Features |
|---------|----------|----------|
| `memory` | Development/Testing | Fast, no persistence |
| `sqlite` | Single instance production | ACID, persistence, moderate performance |
| `redis` | Distributed/High performance | Distributed, high performance, clustering |

### Strategy Options

| Strategy | Options | Description |
|----------|---------|-------------|
| Priority | `fifo`, `lifo`, `priority`, `weighted`, `adaptive` | Request scheduling strategy |
| Circuit Breaker | `enabled`, `failureThreshold`, `successThreshold`, `timeout` | Error isolation configuration |
| Retry | `baseDelay`, `maxDelay`, `multiplier`, `jitter` | Retry behavior configuration |

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance
```

### Test Utilities

```typescript
import { createTestConfiguration, QuickSetup } from '@autotask/queue-system';

describe('Queue Tests', () => {
  let queue: QueueManager;
  
  beforeEach(async () => {
    queue = await QuickSetup.memory();
  });
  
  afterEach(async () => {
    await queue.shutdown();
  });
  
  test('should process requests in priority order', async () => {
    await queue.enqueue('/test1', 'GET', 'zone1', { priority: 5 });
    await queue.enqueue('/test2', 'GET', 'zone1', { priority: 8 });
    
    // Verify priority ordering
    const requests = await queue.getRequests({
      sort: { field: 'priority', direction: 'desc' }
    });
    
    expect(requests[0].priority).toBe(8);
  });
});
```

## 📖 Examples

See the `examples/` directory for comprehensive demos:

- **[error-recovery-demo.ts](../examples/error-recovery-demo.ts)** - Complete fault tolerance demonstration
- **[offline-queue-demo.ts](../examples/offline-queue-demo.ts)** - Offline operation examples
- **[monitoring-demo.ts](../examples/monitoring-demo.ts)** - Real-time monitoring setup
- **[load-testing-demo.ts](../examples/load-testing-demo.ts)** - Performance testing

## 🔍 Debugging

### Enable Debug Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

const queue = new QueueManager({ config, logger });
```

### Common Issues

1. **Queue fills up quickly**
   - Increase `maxConcurrency`
   - Enable batching
   - Check processor performance

2. **High error rates**
   - Review circuit breaker thresholds
   - Check network connectivity
   - Verify API credentials

3. **Memory usage growing**
   - Enable compression in persistence options
   - Reduce retention period
   - Check for memory leaks in processors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: [API Reference](./docs/api.md)
- **Issues**: [GitHub Issues](https://github.com/autotask/queue-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/autotask/queue-system/discussions)

---

**Built with ❤️ for enterprise reliability and performance.**