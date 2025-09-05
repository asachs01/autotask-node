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
    setup = createEntityTestSetup(ActionTypes);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list actiontypes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ActionTypes 1' },
        { id: 2, name: 'ActionTypes 2' },
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

    it('should handle query parameters', async () => {
      const query: IActionTypesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ActionTypes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get actiontypes by id', async () => {
      const mockData = { id: 1, name: 'Test ActionTypes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ActionTypes/1');
    });
  });
});