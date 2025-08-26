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
  PriceListServiceBundles,
  IPriceListServiceBundles,
  IPriceListServiceBundlesQuery,
} from '../../src/entities/pricelistservicebundles';

describe('PriceListServiceBundles Entity', () => {
  let priceListServiceBundles: PriceListServiceBundles;
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

    priceListServiceBundles = new PriceListServiceBundles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistservicebundles successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListServiceBundles 1' },
        { id: 2, name: 'PriceListServiceBundles 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServiceBundles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServiceBundles/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListServiceBundlesQuery = {
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

      await priceListServiceBundles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServiceBundles/query', {
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
    it('should get pricelistservicebundles by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListServiceBundles' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServiceBundles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServiceBundles/1');
    });
  });

  describe('create', () => {
    it('should create pricelistservicebundles successfully', async () => {
      const priceListServiceBundlesData = { name: 'New PriceListServiceBundles' };
      const mockResponse = { id: 1, ...priceListServiceBundlesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServiceBundles.create(priceListServiceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PriceListServiceBundles', priceListServiceBundlesData);
    });
  });

  describe('update', () => {
    it('should update pricelistservicebundles successfully', async () => {
      const priceListServiceBundlesData = { name: 'Updated PriceListServiceBundles' };
      const mockResponse = { id: 1, ...priceListServiceBundlesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServiceBundles.update(1, priceListServiceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PriceListServiceBundles/1', priceListServiceBundlesData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistservicebundles successfully', async () => {
      const priceListServiceBundlesData = { name: 'Patched PriceListServiceBundles' };
      const mockResponse = { id: 1, ...priceListServiceBundlesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListServiceBundles.patch(1, priceListServiceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PriceListServiceBundles/1', priceListServiceBundlesData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistservicebundles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await priceListServiceBundles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PriceListServiceBundles/1');
    });
  });
});