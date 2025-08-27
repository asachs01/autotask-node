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
  BillingItems,
  IBillingItems,
  IBillingItemsQuery,
} from '../../src/entities/billingitems';

describe('BillingItems Entity', () => {
  let billingItems: BillingItems;
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

    billingItems = new BillingItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list billingitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'BillingItems 1' },
        { id: 2, name: 'BillingItems 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/BillingItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IBillingItemsQuery = {
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

      await billingItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/BillingItems/query', {
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
    it('should get billingitems by id', async () => {
      const mockData = { id: 1, name: 'Test BillingItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/BillingItems/1');
    });
  });

  describe('create', () => {
    it('should create billingitems successfully', async () => {
      const billingItemsData = { name: 'New BillingItems' };
      const mockResponse = { id: 1, ...billingItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await billingItems.create(billingItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/BillingItems', billingItemsData);
    });
  });

  describe('update', () => {
    it('should update billingitems successfully', async () => {
      const billingItemsData = { name: 'Updated BillingItems' };
      const mockResponse = { id: 1, ...billingItemsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingItems.update(1, billingItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/BillingItems/1', billingItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update billingitems successfully', async () => {
      const billingItemsData = { name: 'Patched BillingItems' };
      const mockResponse = { id: 1, ...billingItemsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await billingItems.patch(1, billingItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/BillingItems/1', billingItemsData);
    });
  });

  describe('delete', () => {
    it('should delete billingitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await billingItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/BillingItems/1');
    });
  });
});