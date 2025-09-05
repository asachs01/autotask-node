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
  Modules,
  IModules,
  IModulesQuery,
} from '../../src/entities/modules';

describe('Modules Entity', () => {
  let setup: EntityTestSetup<Modules>;

  beforeEach(() => {
    setup = createEntityTestSetup(Modules);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list modules successfully', async () => {
      const mockData = [
        { id: 1, name: 'Modules 1' },
        { id: 2, name: 'Modules 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Modules/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IModulesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Modules/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get modules by id', async () => {
      const mockData = { id: 1, name: 'Test Modules' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Modules/1');
    });
  });
});