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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await quoteItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/QuoteItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IQuoteItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await quoteItems.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/QuoteItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get quoteitems by id', async () => {
      const mockData = { id: 1, name: 'Test QuoteItems' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await quoteItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteItems/1');
    });
  });

  describe('create', () => {
    it('should create quoteitems successfully', async () => {
      const quoteItemsData = { name: 'New QuoteItems' };
      const mockResponse = { id: 1, ...quoteItemsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await quoteItems.create(quoteItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/QuoteItems',
        quoteItemsData
      );
    });
  });

  describe('update', () => {
    it('should update quoteitems successfully', async () => {
      const quoteItemsData = { name: 'Updated QuoteItems' };
      const mockResponse = { id: 1, ...quoteItemsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await quoteItems.update(1, quoteItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/QuoteItems/1',
        quoteItemsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update quoteitems successfully', async () => {
      const quoteItemsData = { name: 'Patched QuoteItems' };
      const mockResponse = { id: 1, ...quoteItemsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await quoteItems.patch(1, quoteItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/QuoteItems/1',
        quoteItemsData
      );
    });
  });

  describe('delete', () => {
    it('should delete quoteitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await quoteItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/QuoteItems/1');
    });
  });
});
