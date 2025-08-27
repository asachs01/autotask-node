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
  PurchaseOrders,
  IPurchaseOrders,
  IPurchaseOrdersQuery,
} from '../../src/entities/purchaseorders';

describe('PurchaseOrders Entity', () => {
  let purchaseOrders: PurchaseOrders;
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

    purchaseOrders = new PurchaseOrders(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list purchaseorders successfully', async () => {
      const mockData = [
        { id: 1, name: 'PurchaseOrders 1' },
        { id: 2, name: 'PurchaseOrders 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrders.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPurchaseOrdersQuery = {
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

      await purchaseOrders.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/query', {
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
    it('should get purchaseorders by id', async () => {
      const mockData = { id: 1, name: 'Test PurchaseOrders' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrders.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/1');
    });
  });

  describe('create', () => {
    it('should create purchaseorders successfully', async () => {
      const purchaseOrdersData = { name: 'New PurchaseOrders' };
      const mockResponse = { id: 1, ...purchaseOrdersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrders.create(purchaseOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PurchaseOrders', purchaseOrdersData);
    });
  });

  describe('update', () => {
    it('should update purchaseorders successfully', async () => {
      const purchaseOrdersData = { name: 'Updated PurchaseOrders' };
      const mockResponse = { id: 1, ...purchaseOrdersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrders.update(1, purchaseOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PurchaseOrders/1', purchaseOrdersData);
    });
  });

  describe('patch', () => {
    it('should partially update purchaseorders successfully', async () => {
      const purchaseOrdersData = { name: 'Patched PurchaseOrders' };
      const mockResponse = { id: 1, ...purchaseOrdersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrders.patch(1, purchaseOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PurchaseOrders/1', purchaseOrdersData);
    });
  });
});