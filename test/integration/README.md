# Integration Tests

This directory contains integration tests for the Autotask API Wrapper that test against a real Autotask API instance.

## Overview

Integration tests validate:
- ✅ Real API connectivity and authentication
- ✅ CRUD operations for all entities
- ✅ Error handling and edge cases
- ✅ Performance and rate limiting
- ✅ Zone detection functionality
- ✅ Data validation and business logic

## Setup

### 1. Prerequisites

- Access to an Autotask sandbox or test environment
- Valid Autotask API credentials (username, integration code, secret)
- Node.js 18+ installed

### 2. Configuration

1. Copy the example environment file:
   ```bash
   cp env.test.example .env.test
   ```

2. Edit `.env.test` with your actual credentials:
   ```bash
   # Required credentials
   AUTOTASK_USERNAME=your-username@company.com
   AUTOTASK_INTEGRATION_CODE=your-integration-code
   AUTOTASK_SECRET=your-secret-key
   
   # Test data (use existing IDs from your environment)
   TEST_ACCOUNT_ID=123
   TEST_CONTACT_ID=456
   TEST_PROJECT_ID=789
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Run both unit and integration tests
npm run test:all

# Skip integration tests (useful for CI without credentials)
SKIP_INTEGRATION_TESTS=true npm run test:integration
```

## Test Structure

### Global Setup (`setup.ts`)
- Initializes Autotask client with credentials
- Tests basic API connectivity
- Sets up global test configuration
- Creates shared logger instance

### Global Teardown (`teardown.ts`)
- Cleans up global resources
- Ensures proper test isolation

### Test Helpers (`helpers/testHelpers.ts`)
- `IntegrationTestHelpers` class with utilities for:
  - Creating test data (tickets, accounts, contacts, projects)
  - Cleaning up test data
  - Retry logic with exponential backoff
  - Rate limiting helpers
- Custom Jest matchers:
  - `toHaveValidId()` - Validates entity has positive numeric ID
  - `toHaveTimestamps()` - Validates entity has creation timestamps
  - `toBeValidAutotaskEntity()` - Validates complete entity structure

### Entity Tests

Each entity has comprehensive integration tests covering:

#### CRUD Operations
- **Create**: Test entity creation with valid data
- **Read**: Test entity retrieval by ID
- **Update**: Test entity modification
- **Delete**: Test entity removal
- **List**: Test entity querying with filters and pagination

#### Business Logic
- Entity-specific validation rules
- Required field validation
- Relationship handling (parent/child entities)
- Status transitions

#### Search and Filtering
- Filter by various fields
- Pagination handling
- Sorting capabilities
- Complex query scenarios

#### Error Handling
- Non-existent entity retrieval
- Invalid data submission
- Permission errors
- Rate limiting scenarios

#### Performance
- Concurrent request handling
- Retry logic validation
- Response time verification

## Test Data Management

### Creation Strategy
- All test data uses timestamp-based naming for uniqueness
- Test entities are tracked for cleanup
- Minimal data creation to avoid API limits

### Cleanup Strategy
- Automatic cleanup in `afterAll` hooks
- Graceful handling of cleanup failures
- Cleanup tracking to prevent orphaned data

### Example Test Data
```typescript
// Test ticket creation
const testTicket = {
  title: `Integration Test Ticket - ${Date.now()}`,
  description: 'Test description',
  accountId: globalThis.__INTEGRATION_CONFIG__.testAccountId,
  status: 1, // New
  priority: 3, // Normal
};
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SKIP_INTEGRATION_TESTS` | No | Set to 'true' to skip all integration tests |
| `AUTOTASK_USERNAME` | Yes | Your Autotask username |
| `AUTOTASK_INTEGRATION_CODE` | Yes | Your integration code |
| `AUTOTASK_SECRET` | Yes | Your secret key |
| `AUTOTASK_API_URL` | No | Override API URL (auto-detected if not provided) |
| `TEST_ACCOUNT_ID` | No | Existing account ID for tests (default: 1) |
| `TEST_CONTACT_ID` | No | Existing contact ID for tests (default: 1) |
| `TEST_PROJECT_ID` | No | Existing project ID for tests (default: 1) |
| `LOG_LEVEL` | No | Logging level (default: 'info') |

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Integration Tests
  env:
    AUTOTASK_USERNAME: ${{ secrets.AUTOTASK_USERNAME }}
    AUTOTASK_INTEGRATION_CODE: ${{ secrets.AUTOTASK_INTEGRATION_CODE }}
    AUTOTASK_SECRET: ${{ secrets.AUTOTASK_SECRET }}
    TEST_ACCOUNT_ID: ${{ secrets.TEST_ACCOUNT_ID }}
  run: npm run test:integration
```

### Skipping in CI
```yaml
- name: Run Tests (Skip Integration)
  env:
    SKIP_INTEGRATION_TESTS: true
  run: npm run test:all
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify credentials in `.env.test`
   - Check integration code is active in Autotask
   - Ensure user has API access permissions

2. **Zone Detection Issues**
   - Check if `AUTOTASK_API_URL` override is needed
   - Verify network connectivity to Autotask servers
   - Check firewall/proxy settings

3. **Rate Limiting**
   - Tests include automatic retry logic
   - Reduce concurrent test execution if needed
   - Check Autotask API limits for your account

4. **Test Data Conflicts**
   - Ensure test IDs in `.env.test` exist in your environment
   - Check permissions for test account/contact/project
   - Verify entity relationships are valid

### Debug Mode

Enable verbose logging:
```bash
LOG_LEVEL=debug npm run test:integration
```

View integration test logs:
```bash
tail -f test/integration/logs/integration-tests.log
```

## Test Reports

Integration tests generate JUnit XML reports in:
- `test/integration/reports/integration-test-results.xml`

These can be consumed by CI/CD systems for test result visualization.

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Data Cleanup**: Always clean up created test data
3. **Error Handling**: Test both success and failure scenarios
4. **Performance**: Keep tests efficient to avoid API rate limits
5. **Documentation**: Document any entity-specific test requirements

## Contributing

When adding new entity integration tests:

1. Follow the existing pattern in `entities/` directory
2. Use the `IntegrationTestHelpers` class for common operations
3. Include comprehensive CRUD, error handling, and business logic tests
4. Add cleanup logic for any created test data
5. Update this README if adding new test patterns or requirements 