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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await priceListProducts.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListProducts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListProductsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await priceListProducts.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListProducts/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get pricelistproducts by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListProducts' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await priceListProducts.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListProducts/1');
    });
  });

  describe('create', () => {
    it('should create pricelistproducts successfully', async () => {
      const priceListProductsData = { name: 'New PriceListProducts' };
      const mockResponse = { id: 1, ...priceListProductsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await priceListProducts.create(priceListProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PriceListProducts', priceListProductsData);
    });
  });

  describe('update', () => {
    it('should update pricelistproducts successfully', async () => {
      const priceListProductsData = { name: 'Updated PriceListProducts' };
      const mockResponse = { id: 1, ...priceListProductsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListProducts.update(1, priceListProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/PriceListProducts/1', priceListProductsData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistproducts successfully', async () => {
      const priceListProductsData = { name: 'Patched PriceListProducts' };
      const mockResponse = { id: 1, ...priceListProductsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListProducts.patch(1, priceListProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/PriceListProducts/1', priceListProductsData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistproducts successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await priceListProducts.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/PriceListProducts/1');
    });
  });
});