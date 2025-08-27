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
  PurchaseOrderItems,
  IPurchaseOrderItems,
  IPurchaseOrderItemsQuery,
} from '../../src/entities/purchaseorderitems';

describe('PurchaseOrderItems Entity', () => {
  let purchaseOrderItems: PurchaseOrderItems;
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

    purchaseOrderItems = new PurchaseOrderItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list purchaseorderitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'PurchaseOrderItems 1' },
        { id: 2, name: 'PurchaseOrderItems 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrderItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPurchaseOrderItemsQuery = {
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

      await purchaseOrderItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrderItems/query', {
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
    it('should get purchaseorderitems by id', async () => {
      const mockData = { id: 1, name: 'Test PurchaseOrderItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PurchaseOrderItems/1');
    });
  });

  describe('create', () => {
    it('should create purchaseorderitems successfully', async () => {
      const purchaseOrderItemsData = { name: 'New PurchaseOrderItems' };
      const mockResponse = { id: 1, ...purchaseOrderItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItems.create(purchaseOrderItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PurchaseOrderItems', purchaseOrderItemsData);
    });
  });

  describe('update', () => {
    it('should update purchaseorderitems successfully', async () => {
      const purchaseOrderItemsData = { name: 'Updated PurchaseOrderItems' };
      const mockResponse = { id: 1, ...purchaseOrderItemsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItems.update(1, purchaseOrderItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PurchaseOrderItems/1', purchaseOrderItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update purchaseorderitems successfully', async () => {
      const purchaseOrderItemsData = { name: 'Patched PurchaseOrderItems' };
      const mockResponse = { id: 1, ...purchaseOrderItemsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await purchaseOrderItems.patch(1, purchaseOrderItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PurchaseOrderItems/1', purchaseOrderItemsData);
    });
  });

  describe('delete', () => {
    it('should delete purchaseorderitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await purchaseOrderItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PurchaseOrderItems/1');
    });
  });
});