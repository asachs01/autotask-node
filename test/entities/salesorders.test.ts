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
  SalesOrders,
  ISalesOrders,
  ISalesOrdersQuery,
} from '../../src/entities/salesorders';

describe('SalesOrders Entity', () => {
  let salesOrders: SalesOrders;
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

    salesOrders = new SalesOrders(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list salesorders successfully', async () => {
      const mockData = [
        { id: 1, name: 'SalesOrders 1' },
        { id: 2, name: 'SalesOrders 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await salesOrders.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/SalesOrders/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ISalesOrdersQuery = {
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

      await salesOrders.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/SalesOrders/query', {
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
    it('should get salesorders by id', async () => {
      const mockData = { id: 1, name: 'Test SalesOrders' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await salesOrders.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/SalesOrders/1');
    });
  });

  describe('create', () => {
    it('should create salesorders successfully', async () => {
      const salesOrdersData = { name: 'New SalesOrders' };
      const mockResponse = { id: 1, ...salesOrdersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await salesOrders.create(salesOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/SalesOrders', salesOrdersData);
    });
  });

  describe('update', () => {
    it('should update salesorders successfully', async () => {
      const salesOrdersData = { name: 'Updated SalesOrders' };
      const mockResponse = { id: 1, ...salesOrdersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await salesOrders.update(1, salesOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/SalesOrders/1', salesOrdersData);
    });
  });

  describe('patch', () => {
    it('should partially update salesorders successfully', async () => {
      const salesOrdersData = { name: 'Patched SalesOrders' };
      const mockResponse = { id: 1, ...salesOrdersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await salesOrders.patch(1, salesOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/SalesOrders/1', salesOrdersData);
    });
  });
});