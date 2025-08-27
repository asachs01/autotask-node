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
  PriceListProductTiers,
  IPriceListProductTiers,
  IPriceListProductTiersQuery,
} from '../../src/entities/pricelistproducttiers';

describe('PriceListProductTiers Entity', () => {
  let priceListProductTiers: PriceListProductTiers;
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

    priceListProductTiers = new PriceListProductTiers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistproducttiers successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListProductTiers 1' },
        { id: 2, name: 'PriceListProductTiers 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProductTiers.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListProductTiers/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListProductTiersQuery = {
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

      await priceListProductTiers.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListProductTiers/query', {
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
    it('should get pricelistproducttiers by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListProductTiers' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProductTiers.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListProductTiers/1');
    });
  });

  describe('create', () => {
    it('should create pricelistproducttiers successfully', async () => {
      const priceListProductTiersData = { name: 'New PriceListProductTiers' };
      const mockResponse = { id: 1, ...priceListProductTiersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProductTiers.create(priceListProductTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PriceListProductTiers', priceListProductTiersData);
    });
  });

  describe('update', () => {
    it('should update pricelistproducttiers successfully', async () => {
      const priceListProductTiersData = { name: 'Updated PriceListProductTiers' };
      const mockResponse = { id: 1, ...priceListProductTiersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProductTiers.update(1, priceListProductTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PriceListProductTiers/1', priceListProductTiersData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistproducttiers successfully', async () => {
      const priceListProductTiersData = { name: 'Patched PriceListProductTiers' };
      const mockResponse = { id: 1, ...priceListProductTiersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProductTiers.patch(1, priceListProductTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PriceListProductTiers/1', priceListProductTiersData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistproducttiers successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await priceListProductTiers.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PriceListProductTiers/1');
    });
  });
});