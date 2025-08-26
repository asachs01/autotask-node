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
  QuoteLocations,
  IQuoteLocations,
  IQuoteLocationsQuery,
} from '../../src/entities/quotelocations';

describe('QuoteLocations Entity', () => {
  let quoteLocations: QuoteLocations;
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

    quoteLocations = new QuoteLocations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list quotelocations successfully', async () => {
      const mockData = [
        { id: 1, name: 'QuoteLocations 1' },
        { id: 2, name: 'QuoteLocations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteLocations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteLocations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IQuoteLocationsQuery = {
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

      await quoteLocations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteLocations/query', {
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
    it('should get quotelocations by id', async () => {
      const mockData = { id: 1, name: 'Test QuoteLocations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteLocations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteLocations/1');
    });
  });

  describe('create', () => {
    it('should create quotelocations successfully', async () => {
      const quoteLocationsData = { name: 'New QuoteLocations' };
      const mockResponse = { id: 1, ...quoteLocationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await quoteLocations.create(quoteLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/QuoteLocations', quoteLocationsData);
    });
  });

  describe('update', () => {
    it('should update quotelocations successfully', async () => {
      const quoteLocationsData = { name: 'Updated QuoteLocations' };
      const mockResponse = { id: 1, ...quoteLocationsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteLocations.update(1, quoteLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/QuoteLocations/1', quoteLocationsData);
    });
  });

  describe('patch', () => {
    it('should partially update quotelocations successfully', async () => {
      const quoteLocationsData = { name: 'Patched QuoteLocations' };
      const mockResponse = { id: 1, ...quoteLocationsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await quoteLocations.patch(1, quoteLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/QuoteLocations/1', quoteLocationsData);
    });
  });

  describe('delete', () => {
    it('should delete quotelocations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await quoteLocations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/QuoteLocations/1');
    });
  });
});