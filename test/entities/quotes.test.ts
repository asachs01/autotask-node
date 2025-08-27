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
import { Quotes, IQuotes, IQuotesQuery } from '../../src/entities/quotes';

describe('Quotes Entity', () => {
  let quotes: Quotes;
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

    quotes = new Quotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list quotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'Quotes 1' },
        { id: 2, name: 'Quotes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quotes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Quotes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        },
      });
    });

    it('should handle query parameters', async () => {
      const query: IQuotesQuery = {
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

      await quotes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/Quotes/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  describe('get', () => {
    it('should get quotes by id', async () => {
      const mockData = { id: 1, name: 'Test Quotes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Quotes/1');
    });
  });

  describe('create', () => {
    it('should create quotes successfully', async () => {
      const quotesData = { name: 'New Quotes' };
      const mockResponse = { id: 1, ...quotesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await quotes.create(quotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes', quotesData);
    });
  });

  describe('update', () => {
    it('should update quotes successfully', async () => {
      const quotesData = { name: 'Updated Quotes' };
      const mockResponse = { id: 1, ...quotesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quotes.update(1, quotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/Quotes/1', quotesData);
    });
  });

  describe('patch', () => {
    it('should partially update quotes successfully', async () => {
      const quotesData = { name: 'Patched Quotes' };
      const mockResponse = { id: 1, ...quotesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quotes.patch(1, quotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/Quotes/1', quotesData);
    });
  });
});
