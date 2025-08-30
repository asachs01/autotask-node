# Autotask Node SDK v2.0.0 - Production Ready

A comprehensive, **production-certified** TypeScript/Node.js SDK for the Kaseya Autotask PSA REST API. Built for developers who need reliable, type-safe access to all 215 Autotask entities with enterprise-grade features.

[![npm version](https://badge.fury.io/js/autotask-node.svg)](https://www.npmjs.com/package/autotask-node)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success)](./PRODUCTION_VALIDATION_REPORT.md)
[![Test Coverage](https://img.shields.io/badge/Coverage-97.8%25-brightgreen)](./PRODUCTION_VALIDATION_REPORT.md)
[![API Coverage](https://img.shields.io/badge/API%20Coverage-100%25-brightgreen)](./docs/ENTITIES.md)
[![Build Status](https://img.shields.io/badge/Build-Passing-success)](./PRODUCTION_VALIDATION_REPORT.md)

## ⚡ Quick Start

### Installation

```bash
npm install autotask-node
```

### Basic Usage

```typescript
import { AutotaskClient } from 'autotask-node';

// Automatic zone detection - no configuration needed
const client = await AutotaskClient.create({
  username: 'your-api-user@domain.com',
  integrationCode: 'YOUR_INTEGRATION_CODE',
  secret: 'YOUR_SECRET',
});

// Create a ticket
const ticket = await client.tickets.create({
  title: 'Network connectivity issue',
  description: 'User cannot access shared drives',
  companyId: 123,
  status: 1, // New
  priority: 2, // High
});

// Advanced querying with the powerful query builder
const urgentTickets = await client.tickets
  .query()
  .where('priority', 'lte', 2) // High or Critical priority
  .where('status', 'in', [1, 5, 8]) // New, In Progress, Waiting Customer
  .where('dueDateTime', 'gte', new Date().toISOString())
  .include('Company', ['companyName'])
  .include('AssignedResource', ['firstName', 'lastName'])
  .orderBy('dueDateTime', 'asc')
  .execute();
```

### 🔥 **NEW: Bulletproof Error Recovery with Queue System**

```typescript
import { QuickSetup } from 'autotask-node';

// Create production-ready queue with persistence
const queue = await QuickSetup.sqlite('./data/autotask-queue.db');

// High-priority requests processed first, with automatic retry
const criticalTicket = await queue.enqueue('/Tickets', 'POST', 'zone1', {
  priority: 10, // Highest priority
  data: { title: 'Critical System Outage', priority: 'Critical' },
  retryable: true,
  metadata: { urgency: 'immediate' }
});

// Batch multiple requests for efficiency
await queue.enqueue('/Companies', 'GET', 'zone1', {
  priority: 5,
  batchable: true // Automatically batched with similar requests
});

// Real-time monitoring and metrics
queue.on('request.completed', (event) => {
  console.log(`✅ ${event.request.endpoint} completed`);
});

queue.on('circuit.opened', (event) => {
  console.log(`🔴 Circuit breaker opened for ${event.zone}`);
});

// Get comprehensive metrics
const metrics = await queue.getMetrics();
console.log({
  queuedRequests: metrics.queuedRequests,
  successRate: `${((1 - metrics.errorRate) * 100).toFixed(2)}%`,
  throughput: `${metrics.throughput.toFixed(2)} req/s`
});

// Graceful shutdown with request completion
await queue.shutdown();
```

## 🚀 Key Features

### Complete API Coverage

- **178 Autotask Entities**: Full CRUD support for all REST API entities
- **Automatic Zone Detection**: No manual region configuration required
- **Type-Safe Operations**: Full TypeScript support with IntelliSense

### Advanced Query Builder

- **Fluent Interface**: Intuitive, chainable query construction
- **Complex Filtering**: 14 comparison operators with logical grouping (AND/OR)
- **Performance Optimization**: Field selection, includes, and efficient pagination
- **Type Safety**: Compile-time validation and runtime error handling

### Enterprise Features

- **Automatic Retry Logic**: Exponential backoff for transient failures
- **Rate Limit Handling**: Intelligent throttling and queue management
- **Comprehensive Logging**: Winston-based observability and debugging
- **Memory Optimization**: Efficient handling of large datasets
- **Error Recovery**: Structured error types with recovery strategies

### 🔥 **NEW: Advanced Queue System**

- **Offline Operations**: Persistent queue survives restarts and outages
- **Circuit Breakers**: Intelligent failure isolation per Autotask zone
- **Request Batching**: Automatic batching for optimal API efficiency
- **Priority Scheduling**: Critical requests processed first
- **Real-time Monitoring**: Comprehensive metrics and health monitoring
- **Multi-backend Storage**: Memory, SQLite, and Redis support
- **Graceful Degradation**: Maintains service under high load

### Developer Experience

- **CLI Tool**: Full-featured command-line interface
- **Extensive Testing**: 460+ unit tests with integration test suite
- **Rich Documentation**: Complete API reference and real-world examples
- **ESM + CJS Support**: Works with both module systems

## 📚 Supported Entities

The SDK provides access to all major Autotask entity categories:

| Category                 | Count | Key Entities                                                            |
| ------------------------ | ----- | ----------------------------------------------------------------------- |
| **Core Business**        | 7     | Companies, Contacts, Tickets, Projects, Tasks, Resources, Opportunities |
| **Contract Management**  | 24    | Contracts, ContractServices, ContractRates, ContractBillingRules        |
| **Financial**            | 19    | Invoices, Quotes, PurchaseOrders, BillingItems, TimeEntries             |
| **Configuration**        | 9     | ConfigurationItems, ConfigurationItemTypes, ConfigurationItemCategories |
| **Time Tracking**        | 11    | TimeEntries, Appointments, Holidays, TimeOffRequests                    |
| **Inventory**            | 12    | Products, InventoryItems, InventoryLocations, ProductVendors            |
| **Knowledge Base**       | 19    | Documents, Articles, KnowledgeBaseArticles                              |
| **+ 10 more categories** | 77    | Attachments, Notes, Service Calls, Surveys, Tags, and more              |

[View complete entity reference →](docs/ENTITIES.md)

## 🔧 Authentication & Setup

### Authentication Method

The SDK uses Autotask's header-based authentication with three required headers:
- `ApiIntegrationCode`: Your Autotask API integration code
- `UserName`: Your API username (email address)
- `Secret`: Your API secret/password

**Note:** This SDK does NOT use Basic Authentication. All credentials are sent as separate headers as required by the Autotask REST API.

### Environment Variables (Recommended)

```bash
# Set these environment variables
export AUTOTASK_USERNAME="your-api-user@domain.com"
export AUTOTASK_INTEGRATION_CODE="YOUR_INTEGRATION_CODE"
export AUTOTASK_SECRET="YOUR_SECRET"
```

Or create a `.env` file:

```bash
AUTOTASK_USERNAME=your-api-user@domain.com
AUTOTASK_INTEGRATION_CODE=YOUR_INTEGRATION_CODE
AUTOTASK_SECRET=YOUR_SECRET
```

### Direct Configuration

```typescript
const client = await AutotaskClient.create({
  username: 'your-api-user@domain.com',
  integrationCode: 'YOUR_INTEGRATION_CODE',
  secret: 'YOUR_SECRET',
  performanceConfig: {
    timeout: 30000,
    retries: 3,
    rateLimitThreshold: 80,
  },
});
```

### Zone Detection

The SDK automatically detects your Autotask API zone - no manual configuration required:

```typescript
// Zone detection happens automatically during client creation
const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!,
  // apiUrl is automatically detected and set
});
```

## 💡 Usage Examples

### Basic CRUD Operations

```typescript
// Create a company
const company = await client.companies.create({
  companyName: 'Acme Corporation',
  companyType: 1, // Customer
  isActive: true,
  phone: '555-123-4567',
});

// Create a contact
const contact = await client.contacts.create({
  companyId: company.id,
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john.doe@acme.com',
  isPrimaryContact: true,
});

// Update a ticket
const updatedTicket = await client.tickets.update(ticketId, {
  status: 5, // In Progress
  assignedResourceId: 123,
});
```

### Advanced Querying

```typescript
// Complex filtering with logical grouping
const criticalTickets = await client.tickets
  .query()
  .where('companyId', 'eq', 123)
  .and(builder => {
    builder
      .where('priority', 'in', [1, 2]) // Critical or High
      .or(subBuilder => {
        subBuilder
          .where('status', 'eq', 1) // New tickets
          .where('estimatedHours', 'gt', 10); // Large tickets
      });
  })
  .include('Company', ['companyName'])
  .include('AssignedResource', ['firstName', 'lastName'])
  .orderBy('priority', 'asc')
  .orderBy('dueDateTime', 'asc')
  .execute();

// Performance-optimized queries
const lightweightTickets = await client.tickets
  .query()
  .select('id', 'title', 'status', 'priority') // Only needed fields
  .where('createDate', 'gte', '2024-01-01')
  .limit(100)
  .execute();
```

### Error Handling

```typescript
import {
  ValidationError,
  RateLimitError,
  AuthenticationError,
} from 'autotask-node';

try {
  const ticket = await client.tickets.create(ticketData);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.fieldErrors);
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  }
}
```

## 🖥️ Command Line Interface

The SDK includes a full-featured CLI for quick operations:

```bash
# List open tickets
npx autotask-node tickets list '{"status": 1}'

# Create a new company
npx autotask-node companies create '{
  "companyName": "New Customer",
  "companyType": 1,
  "isActive": true
}'

# Update ticket with complex filter
npx autotask-node tickets update 12345 '{
  "status": 5,
  "assignedResourceId": 456
}'

# Get detailed entity information
npx autotask-node tickets get 12345 --include Company,AssignedResource
```

## 📖 Documentation

| Document                                     | Description                                           |
| -------------------------------------------- | ----------------------------------------------------- |
| [API Reference](docs/API.md)                 | Complete API documentation with all methods and types |
| [Entity Reference](docs/ENTITIES.md)         | Detailed guide to all 178 supported entities          |
| [Query Builder Guide](docs/QUERY_BUILDER.md) | Advanced querying techniques and examples             |
| [Usage Examples](docs/EXAMPLES.md)           | Real-world scenarios and integration patterns         |

## 🏗️ Advanced Features

### Query Builder Operators

| Operator                             | Description          | Example                                                         |
| ------------------------------------ | -------------------- | --------------------------------------------------------------- |
| `eq`, `ne`                           | Equals, Not equals   | `.where('status', 'eq', 1)`                                     |
| `gt`, `gte`, `lt`, `lte`             | Comparison operators | `.where('priority', 'lte', 2)`                                  |
| `contains`, `startsWith`, `endsWith` | String matching      | `.where('title', 'contains', 'urgent')`                         |
| `in`, `notIn`                        | Array membership     | `.where('status', 'in', [1, 5, 8])`                             |
| `isNull`, `isNotNull`                | Null checking        | `.where('assignedResourceId', 'isNull')`                        |
| `between`                            | Range queries        | `.where('createDate', 'between', ['2024-01-01', '2024-12-31'])` |

### Performance Configuration

```typescript
const client = await AutotaskClient.create({
  username: process.env.AUTOTASK_USERNAME!,
  integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
  secret: process.env.AUTOTASK_SECRET!,
  performanceConfig: {
    timeout: 45000, // Request timeout
    retries: 5, // Retry attempts
    retryDelay: 2000, // Retry delay
    rateLimitThreshold: 70, // Rate limit threshold
    concurrency: 3, // Max concurrent requests
    enableCompression: true, // Enable gzip
    enableCaching: false, // Response caching
  },
});
```

### Logging and Debugging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'autotask.log' }),
  ],
});

const client = await AutotaskClient.create({
  // ... credentials
  logger,
});
```

## 🧪 Testing

The SDK includes comprehensive testing infrastructure:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests (requires API credentials)
npm run test:integration

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**

- **460+ Unit Tests**: Complete coverage of all functionality
- **Integration Tests**: Real API validation with rate limit respect
- **Custom Matchers**: Autotask-specific test assertions
- **Performance Tests**: Memory and efficiency validation

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 📋 Requirements

- **Node.js**: 18.0.0 or higher
- **TypeScript**: 5.0+ (for development)
- **Autotask API**: Valid integration credentials

## 🔒 Security

- Secure credential handling with environment variable support
- Automatic token management and refresh
- Request validation and sanitization
- No sensitive data in logs or error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/asachs01/autotask-node/issues)
- **Documentation**: [Complete Documentation](docs/)
- **Examples**: [Real-world Examples](docs/EXAMPLES.md)

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and migration guides.

---

**Built with ❤️ for the Autotask community**

_The Autotask Node SDK is not officially affiliated with Kaseya or Autotask. It is an independent project designed to make Autotask API integration easier and more reliable._
