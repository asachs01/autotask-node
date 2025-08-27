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
  PriceListWorkTypeModifiers,
  IPriceListWorkTypeModifiers,
  IPriceListWorkTypeModifiersQuery,
} from '../../src/entities/pricelistworktypemodifiers';

describe('PriceListWorkTypeModifiers Entity', () => {
  let priceListWorkTypeModifiers: PriceListWorkTypeModifiers;
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

    priceListWorkTypeModifiers = new PriceListWorkTypeModifiers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistworktypemodifiers successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListWorkTypeModifiers 1' },
        { id: 2, name: 'PriceListWorkTypeModifiers 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListWorkTypeModifiers.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListWorkTypeModifiersQuery = {
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

      await priceListWorkTypeModifiers.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/query', {
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
    it('should get pricelistworktypemodifiers by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListWorkTypeModifiers' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListWorkTypeModifiers.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1');
    });
  });

  describe('create', () => {
    it('should create pricelistworktypemodifiers successfully', async () => {
      const priceListWorkTypeModifiersData = { name: 'New PriceListWorkTypeModifiers' };
      const mockResponse = { id: 1, ...priceListWorkTypeModifiersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await priceListWorkTypeModifiers.create(priceListWorkTypeModifiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PriceListWorkTypeModifiers', priceListWorkTypeModifiersData);
    });
  });

  describe('update', () => {
    it('should update pricelistworktypemodifiers successfully', async () => {
      const priceListWorkTypeModifiersData = { name: 'Updated PriceListWorkTypeModifiers' };
      const mockResponse = { id: 1, ...priceListWorkTypeModifiersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListWorkTypeModifiers.update(1, priceListWorkTypeModifiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1', priceListWorkTypeModifiersData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistworktypemodifiers successfully', async () => {
      const priceListWorkTypeModifiersData = { name: 'Patched PriceListWorkTypeModifiers' };
      const mockResponse = { id: 1, ...priceListWorkTypeModifiersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListWorkTypeModifiers.patch(1, priceListWorkTypeModifiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1', priceListWorkTypeModifiersData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistworktypemodifiers successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await priceListWorkTypeModifiers.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PriceListWorkTypeModifiers/1');
    });
  });
});