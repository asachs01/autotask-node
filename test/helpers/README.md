# Entity Test Mocking Solution

This directory contains the solution to fix entity test mocking issues that were causing tests to make real network calls.

## The Problem

Entity tests were failing because:
1. BaseEntity creates a real RequestHandler when none is provided
2. RequestHandler sets up real axios interceptors and networking logic
3. Mocked axios instances were incomplete
4. Tests were trying to make actual network calls

## The Solution

### Core Files

- `mockHelper.ts` - Comprehensive mocking utilities
- `testPatterns.md` - Migration patterns and examples
- `README.md` - This documentation

### Key Components

1. **createEntityTestSetup(EntityClass)** - Creates properly mocked entity instances
2. **createMockRequestHandler()** - Provides a fully mocked RequestHandler
3. **createMockItemResponse/createMockItemsResponse()** - Consistent response formatting
4. **resetAllMocks()** - Clean state between tests

## Migration Status

### ✅ Fixed Tests (Working Examples)
- `actiontypes.test.ts` - Complete CRUD operations
- `ticketcharges.test.ts` - Complete CRUD operations  
- `pricelistservices.test.ts` - Complete CRUD operations

### 🔄 Remaining Tests (Need Migration)
- Approximately 212 entity test files still need updating
- Use the patterns from working examples to migrate remaining tests

## Usage Example

```typescript
import { createEntityTestSetup, createMockItemResponse } from '../helpers/mockHelper';
import { ActionTypes } from '../../src/entities/actiontypes';

describe('Entity Tests', () => {
  let setup: EntityTestSetup<ActionTypes>;

  beforeEach(() => {
    setup = createEntityTestSetup(ActionTypes);
  });

  it('should work without network calls', async () => {
    setup.mockAxios.get.mockResolvedValueOnce(
      createMockItemResponse({ id: 1, name: 'test' })
    );

    const result = await setup.entity.get(1);
    expect(result.data).toEqual({ id: 1, name: 'test' });
  });
});
```

## Migration Script

A helper script is available at `/scripts/update-entity-test.sh` for basic pattern replacement, but manual review is required for each file.

## Test Results

After fixing 5 entity test files:
- **Before**: 217 test suites failing
- **After**: 5 test suites passing, 212 still need migration
- **Success Rate**: Tests now run without network calls when properly migrated

## Next Steps

1. Systematically migrate remaining entity tests using the established patterns
2. Ensure all HTTP method expectations are correct (GET for single items, POST for queries)
3. Use proper response helper functions for consistent formatting
4. Test each migrated file individually before bulk testing