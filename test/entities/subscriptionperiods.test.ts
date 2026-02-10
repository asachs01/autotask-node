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
  SubscriptionPeriods,
  ISubscriptionPeriods,
  ISubscriptionPeriodsQuery,
} from '../../src/entities/subscriptionperiods';

describe('SubscriptionPeriods Entity', () => {
  let subscriptionPeriods: SubscriptionPeriods;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockLogger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })],
    });

    subscriptionPeriods = new SubscriptionPeriods(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list subscriptionperiods successfully', async () => {
      const mockData = [
        { id: 1, name: 'SubscriptionPeriods 1' },
        { id: 2, name: 'SubscriptionPeriods 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await subscriptionPeriods.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/SubscriptionPeriods/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ISubscriptionPeriodsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await subscriptionPeriods.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/SubscriptionPeriods/query',
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
    it('should get subscriptionperiods by id', async () => {
      const mockData = { id: 1, name: 'Test SubscriptionPeriods' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await subscriptionPeriods.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/SubscriptionPeriods/1');
    });
  });

  describe('create', () => {
    it('should create subscriptionperiods successfully', async () => {
      const subscriptionPeriodsData = { name: 'New SubscriptionPeriods' };
      const mockResponse = { id: 1, ...subscriptionPeriodsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await subscriptionPeriods.create(subscriptionPeriodsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/SubscriptionPeriods',
        subscriptionPeriodsData
      );
    });
  });

  describe('update', () => {
    it('should update subscriptionperiods successfully', async () => {
      const subscriptionPeriodsData = { name: 'Updated SubscriptionPeriods' };
      const mockResponse = { id: 1, ...subscriptionPeriodsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await subscriptionPeriods.update(
        1,
        subscriptionPeriodsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/SubscriptionPeriods/1',
        subscriptionPeriodsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update subscriptionperiods successfully', async () => {
      const subscriptionPeriodsData = { name: 'Patched SubscriptionPeriods' };
      const mockResponse = { id: 1, ...subscriptionPeriodsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await subscriptionPeriods.patch(
        1,
        subscriptionPeriodsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/SubscriptionPeriods/1',
        subscriptionPeriodsData
      );
    });
  });

  describe('delete', () => {
    it('should delete subscriptionperiods successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await subscriptionPeriods.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/SubscriptionPeriods/1');
    });
  });
});
