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
  Subscriptions,
  ISubscriptions,
  ISubscriptionsQuery,
} from '../../src/entities/subscriptions';

describe('Subscriptions Entity', () => {
  let subscriptions: Subscriptions;
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

    subscriptions = new Subscriptions(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list subscriptions successfully', async () => {
      const mockData = [
        { id: 1, name: 'Subscriptions 1' },
        { id: 2, name: 'Subscriptions 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await subscriptions.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Subscriptions/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ISubscriptionsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await subscriptions.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/Subscriptions/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('get', () => {
    it('should get subscriptions by id', async () => {
      const mockData = { id: 1, name: 'Test Subscriptions' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await subscriptions.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Subscriptions/1');
    });
  });

  describe('create', () => {
    it('should create subscriptions successfully', async () => {
      const subscriptionsData = { name: 'New Subscriptions' };
      const mockResponse = { id: 1, ...subscriptionsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await subscriptions.create(subscriptionsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/Subscriptions', subscriptionsData);
    });
  });

  describe('update', () => {
    it('should update subscriptions successfully', async () => {
      const subscriptionsData = { name: 'Updated Subscriptions' };
      const mockResponse = { id: 1, ...subscriptionsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await subscriptions.update(1, subscriptionsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/Subscriptions/1', subscriptionsData);
    });
  });

  describe('patch', () => {
    it('should partially update subscriptions successfully', async () => {
      const subscriptionsData = { name: 'Patched Subscriptions' };
      const mockResponse = { id: 1, ...subscriptionsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await subscriptions.patch(1, subscriptionsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/Subscriptions/1', subscriptionsData);
    });
  });

  describe('delete', () => {
    it('should delete subscriptions successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await subscriptions.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/Subscriptions/1');
    });
  });
});