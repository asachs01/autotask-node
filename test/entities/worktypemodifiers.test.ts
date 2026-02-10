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
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import {
  WorkTypeModifiers,
  IWorkTypeModifiers,
  IWorkTypeModifiersQuery,
} from '../../src/entities/worktypemodifiers';

describe('WorkTypeModifiers Entity', () => {
  let setup: EntityTestSetup<WorkTypeModifiers>;

  beforeEach(() => {
    setup = createEntityTestSetup(WorkTypeModifiers);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list worktypemodifiers successfully', async () => {
      const mockData = [
        { id: 1, name: 'WorkTypeModifiers 1' },
        { id: 2, name: 'WorkTypeModifiers 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/WorkTypeModifiers/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IWorkTypeModifiersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/WorkTypeModifiers/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          maxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get worktypemodifiers by id', async () => {
      const mockData = { id: 1, name: 'Test WorkTypeModifiers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/WorkTypeModifiers/1');
    });
  });
});
