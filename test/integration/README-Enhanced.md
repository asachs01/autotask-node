# Enhanced Autotask API Integration Test Suite

A comprehensive, production-safe integration testing framework for the Autotask Node.js SDK that validates real API behavior while protecting production data.

## 🌟 Features

### **Safe Test Environment**
- **Environment-based safety controls**: Sandbox, Staging, Production-ReadOnly modes
- **Automatic operation restrictions**: Prevents destructive operations in production
- **Smart test data management**: Automatic cleanup with rollback mechanisms
- **Connection validation**: Pre-test API connectivity verification

### **Comprehensive Test Coverage**
- **Core Entity Testing**: Companies, Contacts, Tickets, Projects, Tasks, Time Entries
- **CRUD Operation Validation**: Create, Read, Update, Delete (when safe)
- **Business Logic Integration**: Validates relationships and business rules
- **Performance Testing**: Rate limiting, concurrency, large dataset handling
- **Error Handling**: Network errors, API errors, recovery mechanisms

### **Advanced Performance Testing**
- **Rate Limit Validation**: Tests API rate limiting and backoff strategies
- **Concurrent Request Handling**: Multi-threaded request validation
- **Memory Usage Monitoring**: Large dataset memory efficiency
- **Response Time Benchmarks**: Performance threshold validation
- **Throughput Analysis**: Request per second capabilities

### **Enterprise-Grade Reporting**
- **Multi-format Reports**: JSON, HTML, Markdown
- **Performance Metrics**: Response times, throughput, error rates
- **Entity Coverage Analysis**: Which entities and operations were tested
- **Error Pattern Analysis**: Categorized error reporting
- **Recommendations**: Actionable insights based on test results

## 🚀 Quick Start

### 1. Configuration

```bash
# Copy the example configuration
cp env.test.example .env.test

# Edit .env.test with your Autotask credentials
```

### 2. Basic Integration Tests

```bash
# Run enhanced integration test suite
npm run test:integration:enhanced

# Run with debug output
npm run test:integration:enhanced:debug

# Run all tests (unit + enhanced integration)
npm run test:all:enhanced
```

### 3. Environment-Specific Testing

```bash
# Production-safe read-only testing (default)
TEST_ENVIRONMENT=production-readonly npm run test:integration:enhanced

# Full CRUD testing in sandbox
TEST_ENVIRONMENT=sandbox npm run test:integration:enhanced

# Staging environment testing
TEST_ENVIRONMENT=staging npm run test:integration:enhanced
```

## 🏗️ Architecture

### Test Framework Structure

```
test/integration/
├── framework/                  # Core testing framework
│   ├── TestEnvironment.ts     # Environment management & safety
│   ├── TestDataFactory.ts     # Safe test data generation
│   └── PerformanceTester.ts    # Performance testing utilities
├── config/                     # Configuration management
│   └── TestConfig.ts          # Environment-aware configuration
├── suites/                     # Test suites
│   ├── CoreEntitiesIntegration.test.ts     # Entity CRUD tests
│   ├── PerformanceIntegration.test.ts      # Performance tests
│   ├── BusinessLogicIntegration.test.ts    # Business logic tests
│   └── ErrorHandlingIntegration.test.ts    # Error handling tests
├── reporting/                  # Test reporting
│   └── TestReporter.ts        # Multi-format report generation
└── reports/                    # Generated reports
    ├── *.json                 # JSON reports
    ├── *.html                 # HTML reports
    └── *.md                   # Markdown reports
```

### Safety Architecture

The test suite uses a three-tier safety model:

1. **Environment Detection**: Auto-detects environment type based on credentials
2. **Operation Restrictions**: Enforces read-only mode in production environments  
3. **Data Lifecycle Management**: Automatic cleanup with rollback capabilities

```typescript
// Environment-based safety controls
if (testEnvironment.isOperationAllowed('create')) {
  // Only runs in sandbox/staging environments
  const result = await client.tickets.create(testData);
  testEnvironment.registerCreatedEntity('tickets', result.data.id);
}
```

## 🧪 Test Suites

### Core Entities Integration Tests

Validates fundamental entity operations:

- **Companies (Accounts)**: List, get, create, update operations
- **Contacts**: CRUD operations with account relationships
- **Tickets**: Full workflow testing with business logic
- **Projects**: Project-account relationship validation
- **Cross-Entity Relationships**: Data consistency validation

### Performance Integration Tests

Comprehensive performance validation:

- **Rate Limiting**: API rate limit detection and recovery
- **Concurrent Requests**: Multi-threaded request handling
- **Large Dataset Pagination**: Memory-efficient data retrieval
- **Response Time Benchmarks**: Performance threshold validation
- **Network Recovery**: Timeout and retry mechanism validation

### Business Logic Integration Tests

Validates business rules and relationships:

- **Field Validation**: Required fields, data formats
- **Cross-Entity Relationships**: Referential integrity
- **Workflow Validation**: Status transitions, SLA compliance
- **Data Integrity**: Orphaned record detection

### Error Handling Integration Tests

Comprehensive error scenario testing:

- **HTTP Error Handling**: 404, 400, 401, 403, 500 responses
- **Network Recovery**: Connection timeouts, DNS failures
- **Rate Limit Recovery**: Exponential backoff validation
- **Transaction Recovery**: Partial operation failure handling

## 📊 Reporting

### Report Types

1. **Executive Summary**: High-level test results and metrics
2. **Performance Analysis**: Response times, throughput, error rates
3. **Entity Coverage**: Which entities and operations were tested
4. **Error Analysis**: Categorized error reporting with patterns
5. **Recommendations**: Actionable insights for improvement

### Sample Report Structure

```markdown
# Integration Test Report

## Executive Summary
- Environment: production-readonly
- Total Tests: 127
- Success Rate: 94.5%
- Duration: 180.3 seconds

## Performance Analysis
- Average Response Time: 1,250ms
- Total Throughput: 8.5 req/sec
- Error Rate: 2.1%
- Total Requests: 1,534

## Entity Coverage
- Coverage: 8/12 entities (66.7%)
- Business Logic Tested: ✅
- Performance Tested: ✅

## Recommendations
- Consider optimizing response times (currently > 1s average)
- Expand test coverage to more entity types
```

## ⚙️ Configuration

### Environment Variables

```bash
# Core Configuration
SKIP_INTEGRATION_TESTS=false
TEST_ENVIRONMENT=production-readonly

# Autotask API Credentials
AUTOTASK_USERNAME=your-username@company.com
AUTOTASK_INTEGRATION_CODE=your-integration-code
AUTOTASK_SECRET=your-secret-key
AUTOTASK_API_URL=https://webservicesX.autotask.net/ATServicesRest

# Test Data (existing IDs in your environment)
TEST_ACCOUNT_ID=1
TEST_CONTACT_ID=1
TEST_PROJECT_ID=1

# Performance Settings
MAX_RETRIES=3
BASE_RETRY_DELAY=1000
TEST_TIMEOUT=60000

# Logging
LOG_LEVEL=info
DEBUG_INTEGRATION_TESTS=false
```

### Environment Types

| Environment | Data Creation | Data Modification | Data Deletion | Use Case |
|-------------|---------------|-------------------|---------------|-----------|
| `sandbox` | ✅ Allowed | ✅ Allowed | ✅ Allowed | Full CRUD testing |
| `staging` | ❌ Read-only | ❌ Read-only | ❌ Read-only | Pre-production validation |
| `production-readonly` | ❌ Read-only | ❌ Read-only | ❌ Read-only | Production validation (default) |

## 🔒 Safety Features

### Automatic Safety Controls

- **Environment Detection**: Auto-detects environment based on URL patterns and usernames
- **Operation Restrictions**: Prevents destructive operations in production
- **Rate Limiting**: Respects API rate limits with intelligent backoff
- **Connection Validation**: Verifies API connectivity before running tests
- **Error Recovery**: Graceful handling of network and API errors

### Data Protection

- **Test Data Isolation**: Uses unique identifiers for all test data
- **Automatic Cleanup**: Removes created entities after test completion
- **Rollback Mechanisms**: Undoes changes if tests fail mid-execution
- **Production Guards**: Multiple layers of protection against production data modification

## 🛠️ Development

### Adding New Test Suites

```typescript
import { TestEnvironment } from '../framework/TestEnvironment';
import { TestDataFactory } from '../framework/TestDataFactory';
import { loadTestConfig } from '../config/TestConfig';

describe('My Custom Integration Tests', () => {
  let testEnvironment: TestEnvironment;
  let testDataFactory: TestDataFactory;
  
  beforeAll(async () => {
    const config = loadTestConfig();
    if (config.skipIntegrationTests) return;
    
    const client = new AutotaskClient(config.autotask);
    testEnvironment = new TestEnvironment(client, config.environment);
    await testEnvironment.initialize();
    
    testDataFactory = new TestDataFactory(testEnvironment);
  });
  
  it('should test custom functionality', async () => {
    if (testConfig.skipIntegrationTests) return;
    
    // Your test logic here
    const result = await testEnvironment.executeWithRateLimit(async () => {
      return await client.customEntity.list();
    });
    
    expect(result.data).toBeDefined();
  });
});
```

### Custom Performance Tests

```typescript
it('should meet custom performance requirements', async () => {
  const performanceTester = new PerformanceTester(testEnvironment);
  
  const metrics = await performanceTester.testConcurrentRequests('customEntity', 10);
  
  expect(metrics.successfulRequests).toBeGreaterThan(8); // 80% success rate
  expect(metrics.averageResponseTime).toBeLessThan(5000); // Under 5 seconds
});
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - name: Run Integration Tests
        env:
          AUTOTASK_USERNAME: ${{ secrets.AUTOTASK_USERNAME }}
          AUTOTASK_INTEGRATION_CODE: ${{ secrets.AUTOTASK_INTEGRATION_CODE }}
          AUTOTASK_SECRET: ${{ secrets.AUTOTASK_SECRET }}
          TEST_ENVIRONMENT: production-readonly
        run: npm run test:integration:enhanced
      
      - name: Upload Test Reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: integration-test-reports
          path: test/integration/reports/
```

### Environment-Specific Testing

```yaml
# Production validation (safe)
- name: Production Validation
  env:
    TEST_ENVIRONMENT: production-readonly
  run: npm run test:integration:enhanced

# Staging validation
- name: Staging Tests
  if: github.ref == 'refs/heads/staging'
  env:
    TEST_ENVIRONMENT: staging
  run: npm run test:integration:enhanced

# Full CRUD testing (sandbox only)
- name: Sandbox Full Tests
  if: github.ref == 'refs/heads/develop'
  env:
    TEST_ENVIRONMENT: sandbox
  run: npm run test:integration:enhanced
```

## 📈 Best Practices

### Test Data Management

- Use unique identifiers for all test data
- Register created entities for automatic cleanup
- Implement rollback mechanisms for failed operations
- Validate data relationships and integrity

### Performance Testing

- Respect API rate limits with intelligent backoff
- Test concurrent operations within reasonable limits
- Monitor memory usage with large datasets
- Establish performance baselines and thresholds

### Error Handling

- Test all expected error scenarios
- Validate error message structure and content
- Test recovery mechanisms and retry logic
- Handle network and connectivity issues gracefully

### Security

- Never hardcode credentials in test files
- Use environment variables for sensitive data
- Implement multiple layers of production protection
- Validate authentication and authorization scenarios

## 🤝 Contributing

When adding new integration tests:

1. Follow the existing test structure and patterns
2. Implement proper safety controls and cleanup
3. Add comprehensive error handling
4. Update documentation and examples
5. Test in multiple environments before submitting

## 📝 License

This integration test suite is part of the Autotask Node.js SDK and follows the same MIT license terms.

---

**🛡️ Safety First**: This test suite is designed to be production-safe by default. Always verify your environment configuration before running tests against production systems.
