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
  Subscriptions,
  ISubscriptions,
  ISubscriptionsQuery,
} from '../../src/entities/subscriptions';

describe('Subscriptions Entity', () => {
  let setup: EntityTestSetup<Subscriptions>;

  beforeEach(() => {
    setup = createEntityTestSetup(Subscriptions);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list subscriptions successfully', async () => {
      const mockData = [
        { id: 1, name: 'Subscriptions 1' },
        { id: 2, name: 'Subscriptions 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Subscriptions/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ISubscriptionsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Subscriptions/query',
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
    it('should get subscriptions by id', async () => {
      const mockData = { id: 1, name: 'Test Subscriptions' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Subscriptions/1');
    });
  });

  describe('create', () => {
    it('should create subscriptions successfully', async () => {
      const subscriptionsData = { name: 'New Subscriptions' };
      const mockResponse = { id: 1, ...subscriptionsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(subscriptionsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Subscriptions',
        subscriptionsData
      );
    });
  });

  describe('update', () => {
    it('should update subscriptions successfully', async () => {
      const subscriptionsData = { name: 'Updated Subscriptions' };
      const mockResponse = { id: 1, ...subscriptionsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, subscriptionsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Subscriptions/1',
        subscriptionsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update subscriptions successfully', async () => {
      const subscriptionsData = { name: 'Patched Subscriptions' };
      const mockResponse = { id: 1, ...subscriptionsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, subscriptionsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Subscriptions/1',
        subscriptionsData
      );
    });
  });

  describe('delete', () => {
    it('should delete subscriptions successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Subscriptions/1');
    });
  });
});
