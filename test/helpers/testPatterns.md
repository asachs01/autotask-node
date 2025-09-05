# Entity Test Migration Pattern

## Before (OLD PATTERN - BROKEN)
```typescript
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import {
  ActionTypes,
  IActionTypes,
  IActionTypesQuery,
} from '../../src/entities/actiontypes';

describe('ActionTypes Entity', () => {
  let actionTypes: ActionTypes;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      // ... incomplete mock setup
    } as any;

    mockLogger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })],
    });

    // THIS CREATES A REAL RequestHandler THAT MAKES NETWORK CALLS!
    actionTypes = new ActionTypes(mockAxios, mockLogger);
  });
```

## After (NEW PATTERN - WORKS)
```typescript
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  ActionTypes,
  IActionTypes,
  IActionTypesQuery,
} from '../../src/entities/actiontypes';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('ActionTypes Entity', () => {
  let setup: EntityTestSetup<ActionTypes>;

  beforeEach(() => {
    // This provides a mocked RequestHandler that doesn't make network calls
    setup = createEntityTestSetup(ActionTypes);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });
```

## Test Examples

### List Operation (POST to /query endpoint)
```typescript
it('should list items successfully', async () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  setup.mockAxios.post.mockResolvedValueOnce(
    createMockItemsResponse(mockData)
  );

  const result = await setup.entity.list();

  expect(result.data).toEqual(mockData);
  expect(setup.mockAxios.post).toHaveBeenCalledWith('/ActionTypes/query', {
    filter: [{ op: 'gte', field: 'id', value: 0 }]
  });
});
```

### Get Operation (GET to /{id} endpoint)
```typescript
it('should get item by id', async () => {
  const mockData = { id: 1, name: 'Test Item' };

  setup.mockAxios.get.mockResolvedValueOnce(
    createMockItemResponse(mockData)
  );

  const result = await setup.entity.get(1);

  expect(result.data).toEqual(mockData);
  expect(setup.mockAxios.get).toHaveBeenCalledWith('/ActionTypes/1');
});
```

### Create Operation (POST to / endpoint)
```typescript
it('should create item successfully', async () => {
  const createData = { name: 'New Item' };
  const createdData = { id: 1, name: 'New Item' };

  setup.mockAxios.post.mockResolvedValueOnce(
    createMockItemResponse(createdData)
  );

  const result = await setup.entity.create(createData);

  expect(result.data).toEqual(createdData);
  expect(setup.mockAxios.post).toHaveBeenCalledWith('/ActionTypes', createData);
});
```

### Update Operation (PATCH to /{id} endpoint)
```typescript
it('should update item successfully', async () => {
  const updateData = { name: 'Updated Item' };
  const updatedData = { id: 1, name: 'Updated Item' };

  setup.mockAxios.patch.mockResolvedValueOnce(
    createMockItemResponse(updatedData)
  );

  const result = await setup.entity.update(1, updateData);

  expect(result.data).toEqual(updatedData);
  expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ActionTypes/1', updateData);
});
```

## Key Differences

1. **RequestHandler Mocking**: The new pattern provides a properly mocked RequestHandler that doesn't make real network calls
2. **Response Helpers**: Use `createMockItemResponse()` and `createMockItemsResponse()` for consistent response formatting
3. **Proper HTTP Methods**: List operations use POST to `/query`, get/create/update use the appropriate methods
4. **Autotask API Format**: Responses are wrapped in `{item: ...}` or `{items: [...]}` format as expected by the API

## Migration Steps

For each entity test file:

1. Update imports to use the mock helper
2. Replace test setup with `createEntityTestSetup(EntityClass)`
3. Update all variable references:
   - `entityInstance` → `setup.entity`
   - `mockAxios` → `setup.mockAxios`
4. Replace manual response mocking with helper functions
5. Fix HTTP method expectations (list operations should expect POST to `/query`)
6. Update parameter format expectations (list operations use body, not params)