# Autotask Enterprise Reliability System

This module provides a comprehensive enterprise-grade reliability system specifically designed for Autotask APIs. It implements production-ready patterns for rate limiting, retry logic, zone management, error handling, and overall system reliability.

## 🚀 Features

### 🎯 Autotask-Specific Optimizations
- **Zone-aware rate limiting** based on Autotask's 10,000 requests/hour limit per database
- **Thread limiting** per endpoint (3 threads max for new integrations)
- **Usage-based latency throttling** following Autotask's documented patterns
- **Intelligent zone detection** and automatic failover
- **Autotask error code mapping** with specific recovery strategies

### 🏗️ Enterprise Architecture
- **Multi-tier priority queue system** with intelligent load shedding  
- **Circuit breaker patterns** with automatic recovery
- **Request replay and reconciliation** for critical operations
- **Comprehensive monitoring** and health checks
- **Graceful degradation** during API outages
- **Production-ready logging** and metrics

### ⚡ Performance Optimization
- **Request deduplication** and batching
- **Predictive throttling** based on usage patterns
- **Connection pooling** and keep-alive optimization  
- **Intelligent backoff** with jitter for different error types
- **Resource management** and memory optimization

## 📦 Components

### AutotaskRateLimiter
Enterprise-grade rate limiting with zone-aware throttling:

```typescript
import { AutotaskRateLimiter } from './rate-limiting';

const rateLimiter = new AutotaskRateLimiter({
  hourlyRequestLimit: 10000,
  threadLimitPerEndpoint: 3,
  enableZoneAwareThrottling: true,
  enablePredictiveThrottling: true
}, logger);

// Register zones
rateLimiter.registerZone('zone1', 'https://webservices1.autotask.net/ATServicesRest/v1.0/');

// Request permission with automatic queuing
await rateLimiter.requestPermission('zone1', '/Companies', 8); // Priority 8
```

### AutotaskRetryPatterns
Sophisticated retry strategies with circuit breakers:

```typescript
import { AutotaskRetryPatterns } from './rate-limiting';

const retryPatterns = new AutotaskRetryPatterns({
  maxRetries: 5,
  baseDelayMs: 1000,
  backoffMultiplier: 2.0,
  circuitBreakerThreshold: 0.5,
  enableRequestReplay: true,
  enableErrorLearning: true
}, logger);

// Execute with intelligent retry
const result = await retryPatterns.executeWithRetry(
  () => api.get('/Companies'),
  '/Companies',
  'GET'
);
```

### ZoneManager
Multi-zone management with automatic failover:

```typescript
import { ZoneManager } from './rate-limiting';

const zoneManager = new ZoneManager(logger, { 
  type: 'weighted_response_time' 
});

// Add zones
zoneManager.addZone({
  zoneId: 'primary',
  name: 'Primary Zone',
  apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
  priority: 10,
  isBackup: false
});

// Auto-detect zone from username
const detectedZone = await zoneManager.autoDetectZone('user@company.com');

// Intelligent zone selection
const bestZone = zoneManager.selectZone({
  requireHealthy: true,
  excludeBackup: true,
  preferredRegion: 'us-east-1'
});
```

### AutotaskErrorHandler
Advanced error handling with recovery strategies:

```typescript
import { AutotaskErrorHandler } from './rate-limiting';

const errorHandler = new AutotaskErrorHandler(logger);

// Handle error with context
const handledError = await errorHandler.handleError(error, {
  endpoint: '/Companies',
  method: 'GET',
  requestId: 'req-123',
  zone: 'primary',
  timestamp: new Date()
});

// Get recovery suggestions
const suggestions = errorHandler.suggestRecoveryActions(handledError, context);

// Analyze error patterns
const patterns = errorHandler.getErrorPatterns();
```

### ProductionReliabilityManager
Comprehensive production reliability orchestration:

```typescript
import { ProductionReliabilityManager } from './rate-limiting';

const reliabilityManager = new ProductionReliabilityManager(
  config, rateLimiter, retryPatterns, zoneManager, errorHandler, logger
);

// Queue request with priority and reliability features
const result = await reliabilityManager.queueRequest(
  '/Companies',
  'GET', 
  'primary',
  () => api.get('/Companies'),
  {
    priority: 8,
    timeout: 30000,
    retryable: true,
    batchable: true
  }
);

// Monitor system health
const health = reliabilityManager.getSystemHealth();
const metrics = reliabilityManager.getMetrics();
```

## 🎨 Factory Functions

### Complete System Creation
```typescript
import { 
  createReliabilitySystem,
  createProductionReliabilitySystem,
  createDevelopmentReliabilitySystem
} from './rate-limiting';

// Production system with optimized defaults
const prodSystem = createProductionReliabilitySystem({
  rateLimiting: {
    hourlyRequestLimit: 10000,
    threadLimitPerEndpoint: 3
  },
  reliability: {
    enableGracefulDegradation: true,
    enableLoadShedding: true
  }
});

// Development system with minimal overhead  
const devSystem = createDevelopmentReliabilitySystem({
  rateLimiting: {
    hourlyRequestLimit: 1000
  }
});
```

## 🏥 Health Monitoring

### System Health Monitoring
```typescript
const health = reliabilityManager.getSystemHealth();

console.log({
  overall: health.overall, // 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE'
  queueUtilization: health.queue.utilization,
  errorRate: health.performance.errorRate,
  zones: health.zones
});
```

### Performance Metrics
```typescript
const metrics = reliabilityManager.getMetrics();

console.log({
  uptime: metrics.uptime,
  availability: metrics.availability,
  totalRequests: metrics.totalRequests,
  averageQueueTime: metrics.averageQueueTime,
  requestsDropped: metrics.requestsDropped
});
```

### Error Analytics
```typescript
const errorStats = errorHandler.getErrorStatistics(3600000); // Last hour

console.log({
  totalErrors: errorStats.totalErrors,
  topErrors: errorStats.topErrors,
  criticalErrors: errorStats.criticalErrors,
  recoverySuccessRate: errorStats.recoverySuccessRate
});
```

## 🔧 Configuration

### Production Configuration
```typescript
const PRODUCTION_CONFIG = {
  rateLimiting: {
    hourlyRequestLimit: 10000,
    threadLimitPerEndpoint: 3,
    enableZoneAwareThrottling: true,
    enablePredictiveThrottling: true,
    maxQueueSize: 1000,
    queueTimeout: 300000
  },
  retryPatterns: {
    maxRetries: 5,
    baseDelayMs: 1000,
    maxDelayMs: 60000,
    circuitBreakerThreshold: 0.5,
    enableRequestReplay: true,
    enableErrorLearning: true
  },
  zoneManagement: {
    loadBalancingStrategy: { type: 'weighted_response_time' }
  },
  reliability: {
    maxQueueSize: 10000,
    enableGracefulDegradation: true,
    enableLoadShedding: true,
    batchingEnabled: true,
    enableReconciliation: true
  }
};
```

### Development Configuration
```typescript
const DEVELOPMENT_CONFIG = {
  rateLimiting: {
    hourlyRequestLimit: 1000,
    threadLimitPerEndpoint: 2,
    enablePredictiveThrottling: false
  },
  retryPatterns: {
    maxRetries: 3,
    baseDelayMs: 500,
    enableRequestReplay: false,
    enableErrorLearning: false
  },
  reliability: {
    maxQueueSize: 1000,
    enableGracefulDegradation: false,
    enableLoadShedding: false,
    batchingEnabled: false
  }
};
```

## 🚨 Event-Driven Architecture

All components emit events for monitoring and integration:

```typescript
// Rate limiter events
rateLimiter.on('requestQueued', (event) => {
  console.log(`Request queued: ${event.requestId}`);
});

rateLimiter.on('requestDequeued', (event) => {
  console.log(`Request processed after ${event.waitTime}ms`);
});

// Zone manager events
zoneManager.on('zoneHealthUpdated', (event) => {
  console.log(`Zone ${event.zoneId} health: ${event.isHealthy}`);
});

zoneManager.on('circuitBreakerOpened', (event) => {
  console.log(`Circuit breaker opened for ${event.zoneId}`);
});

// Error handler events
errorHandler.on('criticalPatternDetected', (pattern) => {
  console.log(`Critical error pattern: ${pattern.errorType}`);
});

// Reliability manager events
reliabilityManager.on('degradationModeChanged', (event) => {
  console.log(`Degraded mode: ${event.enabled} - ${event.reason}`);
});
```

## 📊 Integration with Enhanced Client

```typescript
import { EnhancedAutotaskClient } from '../client/EnhancedAutotaskClient';

const client = await EnhancedAutotaskClient.create({
  username: 'your_username',
  integrationCode: 'your_code',
  secret: 'your_secret',
  environment: 'production',
  enableAutoZoneDetection: true,
  zones: [
    {
      zoneId: 'primary',
      name: 'Primary Zone',
      apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
      priority: 10,
      isBackup: false
    },
    {
      zoneId: 'backup',
      name: 'Backup Zone', 
      apiUrl: 'https://webservices2.autotask.net/ATServicesRest/v1.0/',
      priority: 5,
      isBackup: true
    }
  ]
});

// All requests automatically benefit from reliability features
const tickets = await client.tickets.list({ filter: 'status eq Open' });

// Monitor system health
const health = client.getSystemHealth();
const metrics = client.getReliabilityMetrics();
```

## 🧪 Testing

The system includes comprehensive tests covering:

- Unit tests for each component
- Integration tests for component interaction
- Performance tests for high-load scenarios
- Reliability tests for failure conditions
- Memory leak and resource management tests

```bash
# Run all reliability system tests
npm test -- test/rate-limiting/

# Run specific component tests
npm test -- test/rate-limiting/AutotaskRateLimiter.test.ts
npm test -- test/rate-limiting/ZoneManager.test.ts
npm test -- test/rate-limiting/ReliabilityIntegration.test.ts
```

## 🎯 Production Deployment

### Prerequisites
- Node.js 16+ with TypeScript support
- Autotask API credentials with appropriate permissions
- Production logging infrastructure (recommended)
- Monitoring and alerting system (recommended)

### Environment Variables
```bash
# Autotask credentials
AUTOTASK_USERNAME=your_username
AUTOTASK_INTEGRATION_CODE=your_integration_code  
AUTOTASK_SECRET=your_secret
AUTOTASK_API_URL=https://webservices1.autotask.net/ATServicesRest/v1.0/

# Reliability configuration
RELIABILITY_ENVIRONMENT=production
RELIABILITY_LOG_LEVEL=info
RELIABILITY_ENABLE_METRICS=true
RELIABILITY_HEALTH_CHECK_INTERVAL=30000
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD npm run health-check

EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Best Practices

### 1. Configure for Your Environment
```typescript
// Production: Maximum reliability
const prodSystem = createProductionReliabilitySystem({
  reliability: {
    enableGracefulDegradation: true,
    enableLoadShedding: true,
    maxQueueSize: 10000
  }
});

// Development: Minimal overhead
const devSystem = createDevelopmentReliabilitySystem({
  reliability: {
    enableGracefulDegradation: false,
    maxQueueSize: 100
  }
});
```

### 2. Monitor System Health
```typescript
setInterval(() => {
  const health = client.getSystemHealth();
  
  if (health.overall === 'CRITICAL') {
    // Alert operations team
    alerting.sendAlert('Autotask client in critical state', health);
  }
  
  // Log metrics for monitoring
  monitoring.recordMetrics(client.getReliabilityMetrics());
}, 60000);
```

### 3. Handle Errors Gracefully
```typescript
try {
  const result = await client.executeEnhancedRequest(
    () => client.companies.list(),
    '/Companies',
    'GET',
    { priority: 8, timeout: 30000 }
  );
} catch (error) {
  if (error.isAutotaskError) {
    const suggestions = client.errorHandler.suggestRecoveryActions(error, context);
    console.log('Recovery suggestions:', suggestions);
  }
  
  // Implement fallback logic
  return handleFallback(error);
}
```

### 4. Optimize for Your Use Case
```typescript
// High-frequency requests: Use batching
await client.queueRequest('/Companies', 'GET', 'primary', requestFn, {
  batchable: true,
  priority: 5
});

// Critical requests: High priority, no batching
await client.queueRequest('/Tickets', 'POST', 'primary', requestFn, {
  priority: 10,
  timeout: 60000,
  batchable: false
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/reliability-enhancement`)
3. Add comprehensive tests for new functionality
4. Ensure all existing tests pass
5. Update documentation
6. Submit a pull request

## 📄 License

This reliability system is part of the Autotask Node.js SDK and follows the same licensing terms.

---

**Built for Production • Optimized for Autotask • Enterprise Ready**