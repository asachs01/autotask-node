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
  PriceListMaterialCodes,
  IPriceListMaterialCodes,
  IPriceListMaterialCodesQuery,
} from '../../src/entities/pricelistmaterialcodes';

describe('PriceListMaterialCodes Entity', () => {
  let priceListMaterialCodes: PriceListMaterialCodes;
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

    priceListMaterialCodes = new PriceListMaterialCodes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistmaterialcodes successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListMaterialCodes 1' },
        { id: 2, name: 'PriceListMaterialCodes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListMaterialCodes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListMaterialCodes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListMaterialCodesQuery = {
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

      await priceListMaterialCodes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListMaterialCodes/query', {
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
    it('should get pricelistmaterialcodes by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListMaterialCodes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListMaterialCodes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListMaterialCodes/1');
    });
  });

  describe('create', () => {
    it('should create pricelistmaterialcodes successfully', async () => {
      const priceListMaterialCodesData = { name: 'New PriceListMaterialCodes' };
      const mockResponse = { id: 1, ...priceListMaterialCodesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await priceListMaterialCodes.create(priceListMaterialCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PriceListMaterialCodes', priceListMaterialCodesData);
    });
  });

  describe('update', () => {
    it('should update pricelistmaterialcodes successfully', async () => {
      const priceListMaterialCodesData = { name: 'Updated PriceListMaterialCodes' };
      const mockResponse = { id: 1, ...priceListMaterialCodesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListMaterialCodes.update(1, priceListMaterialCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PriceListMaterialCodes/1', priceListMaterialCodesData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistmaterialcodes successfully', async () => {
      const priceListMaterialCodesData = { name: 'Patched PriceListMaterialCodes' };
      const mockResponse = { id: 1, ...priceListMaterialCodesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListMaterialCodes.patch(1, priceListMaterialCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PriceListMaterialCodes/1', priceListMaterialCodesData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistmaterialcodes successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await priceListMaterialCodes.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PriceListMaterialCodes/1');
    });
  });
});