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
  QuoteItems,
  IQuoteItems,
  IQuoteItemsQuery,
} from '../../src/entities/quoteitems';

describe('QuoteItems Entity', () => {
  let quoteItems: QuoteItems;
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

    quoteItems = new QuoteItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list quoteitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'QuoteItems 1' },
        { id: 2, name: 'QuoteItems 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteItems/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IQuoteItemsQuery = {
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

      await quoteItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteItems/query', {
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
    it('should get quoteitems by id', async () => {
      const mockData = { id: 1, name: 'Test QuoteItems' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteItems/1');
    });
  });

  describe('create', () => {
    it('should create quoteitems successfully', async () => {
      const quoteItemsData = { name: 'New QuoteItems' };
      const mockResponse = { id: 1, ...quoteItemsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await quoteItems.create(quoteItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/QuoteItems', quoteItemsData);
    });
  });

  describe('update', () => {
    it('should update quoteitems successfully', async () => {
      const quoteItemsData = { name: 'Updated QuoteItems' };
      const mockResponse = { id: 1, ...quoteItemsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteItems.update(1, quoteItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/QuoteItems/1', quoteItemsData);
    });
  });

  describe('patch', () => {
    it('should partially update quoteitems successfully', async () => {
      const quoteItemsData = { name: 'Patched QuoteItems' };
      const mockResponse = { id: 1, ...quoteItemsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteItems.patch(1, quoteItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/QuoteItems/1', quoteItemsData);
    });
  });

  describe('delete', () => {
    it('should delete quoteitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await quoteItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/QuoteItems/1');
    });
  });
});