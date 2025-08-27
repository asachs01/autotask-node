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
  PurchaseOrderItemReceiving,
  IPurchaseOrderItemReceiving,
  IPurchaseOrderItemReceivingQuery,
} from '../../src/entities/purchaseorderitemreceiving';

describe('PurchaseOrderItemReceiving Entity', () => {
  let purchaseOrderItemReceiving: PurchaseOrderItemReceiving;
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

    purchaseOrderItemReceiving = new PurchaseOrderItemReceiving(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list purchaseorderitemreceiving successfully', async () => {
      const mockData = [
        { id: 1, name: 'PurchaseOrderItemReceiving 1' },
        { id: 2, name: 'PurchaseOrderItemReceiving 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItemReceiving.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrderItemReceiving/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPurchaseOrderItemReceivingQuery = {
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

      await purchaseOrderItemReceiving.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrderItemReceiving/query', {
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
    it('should get purchaseorderitemreceiving by id', async () => {
      const mockData = { id: 1, name: 'Test PurchaseOrderItemReceiving' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItemReceiving.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrderItemReceiving/1');
    });
  });

  describe('create', () => {
    it('should create purchaseorderitemreceiving successfully', async () => {
      const purchaseOrderItemReceivingData = { name: 'New PurchaseOrderItemReceiving' };
      const mockResponse = { id: 1, ...purchaseOrderItemReceivingData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItemReceiving.create(purchaseOrderItemReceivingData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PurchaseOrderItemReceiving', purchaseOrderItemReceivingData);
    });
  });

  describe('update', () => {
    it('should update purchaseorderitemreceiving successfully', async () => {
      const purchaseOrderItemReceivingData = { name: 'Updated PurchaseOrderItemReceiving' };
      const mockResponse = { id: 1, ...purchaseOrderItemReceivingData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItemReceiving.update(1, purchaseOrderItemReceivingData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PurchaseOrderItemReceiving/1', purchaseOrderItemReceivingData);
    });
  });

  describe('patch', () => {
    it('should partially update purchaseorderitemreceiving successfully', async () => {
      const purchaseOrderItemReceivingData = { name: 'Patched PurchaseOrderItemReceiving' };
      const mockResponse = { id: 1, ...purchaseOrderItemReceivingData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItemReceiving.patch(1, purchaseOrderItemReceivingData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PurchaseOrderItemReceiving/1', purchaseOrderItemReceivingData);
    });
  });
});