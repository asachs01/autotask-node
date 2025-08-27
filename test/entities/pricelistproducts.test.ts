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
  PriceListProducts,
  IPriceListProducts,
  IPriceListProductsQuery,
} from '../../src/entities/pricelistproducts';

describe('PriceListProducts Entity', () => {
  let priceListProducts: PriceListProducts;
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

    priceListProducts = new PriceListProducts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistproducts successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListProducts 1' },
        { id: 2, name: 'PriceListProducts 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProducts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListProducts/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListProductsQuery = {
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

      await priceListProducts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListProducts/query', {
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
    it('should get pricelistproducts by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListProducts' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProducts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListProducts/1');
    });
  });

  describe('create', () => {
    it('should create pricelistproducts successfully', async () => {
      const priceListProductsData = { name: 'New PriceListProducts' };
      const mockResponse = { id: 1, ...priceListProductsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProducts.create(priceListProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/PriceListProducts', priceListProductsData);
    });
  });

  describe('update', () => {
    it('should update pricelistproducts successfully', async () => {
      const priceListProductsData = { name: 'Updated PriceListProducts' };
      const mockResponse = { id: 1, ...priceListProductsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProducts.update(1, priceListProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/PriceListProducts/1', priceListProductsData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistproducts successfully', async () => {
      const priceListProductsData = { name: 'Patched PriceListProducts' };
      const mockResponse = { id: 1, ...priceListProductsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await priceListProducts.patch(1, priceListProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/PriceListProducts/1', priceListProductsData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistproducts successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await priceListProducts.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/PriceListProducts/1');
    });
  });
});