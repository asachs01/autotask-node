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
  ProductTiers,
  IProductTiers,
  IProductTiersQuery,
} from '../../src/entities/producttiers';

describe('ProductTiers Entity', () => {
  let productTiers: ProductTiers;
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

    productTiers = new ProductTiers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list producttiers successfully', async () => {
      const mockData = [
        { id: 1, name: 'ProductTiers 1' },
        { id: 2, name: 'ProductTiers 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productTiers.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProductTiers/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IProductTiersQuery = {
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

      await productTiers.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ProductTiers/query', {
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
    it('should get producttiers by id', async () => {
      const mockData = { id: 1, name: 'Test ProductTiers' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productTiers.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProductTiers/1');
    });
  });

  describe('create', () => {
    it('should create producttiers successfully', async () => {
      const productTiersData = { name: 'New ProductTiers' };
      const mockResponse = { id: 1, ...productTiersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await productTiers.create(productTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ProductTiers', productTiersData);
    });
  });

  describe('update', () => {
    it('should update producttiers successfully', async () => {
      const productTiersData = { name: 'Updated ProductTiers' };
      const mockResponse = { id: 1, ...productTiersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productTiers.update(1, productTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ProductTiers/1', productTiersData);
    });
  });

  describe('patch', () => {
    it('should partially update producttiers successfully', async () => {
      const productTiersData = { name: 'Patched ProductTiers' };
      const mockResponse = { id: 1, ...productTiersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productTiers.patch(1, productTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ProductTiers/1', productTiersData);
    });
  });

  describe('delete', () => {
    it('should delete producttiers successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await productTiers.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ProductTiers/1');
    });
  });
});