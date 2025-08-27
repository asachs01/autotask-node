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
  InventoryProducts,
  IInventoryProducts,
  IInventoryProductsQuery,
} from '../../src/entities/inventoryproducts';

describe('InventoryProducts Entity', () => {
  let inventoryProducts: InventoryProducts;
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

    inventoryProducts = new InventoryProducts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventoryproducts successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryProducts 1' },
        { id: 2, name: 'InventoryProducts 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryProducts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryProducts/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryProductsQuery = {
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

      await inventoryProducts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryProducts/query', {
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
    it('should get inventoryproducts by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryProducts' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryProducts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryProducts/1');
    });
  });

  describe('create', () => {
    it('should create inventoryproducts successfully', async () => {
      const inventoryProductsData = { name: 'New InventoryProducts' };
      const mockResponse = { id: 1, ...inventoryProductsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryProducts.create(inventoryProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/InventoryProducts', inventoryProductsData);
    });
  });

  describe('update', () => {
    it('should update inventoryproducts successfully', async () => {
      const inventoryProductsData = { name: 'Updated InventoryProducts' };
      const mockResponse = { id: 1, ...inventoryProductsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryProducts.update(1, inventoryProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/InventoryProducts/1', inventoryProductsData);
    });
  });

  describe('patch', () => {
    it('should partially update inventoryproducts successfully', async () => {
      const inventoryProductsData = { name: 'Patched InventoryProducts' };
      const mockResponse = { id: 1, ...inventoryProductsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryProducts.patch(1, inventoryProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/InventoryProducts/1', inventoryProductsData);
    });
  });

  describe('delete', () => {
    it('should delete inventoryproducts successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await inventoryProducts.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/InventoryProducts/1');
    });
  });
});