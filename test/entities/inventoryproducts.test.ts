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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await inventoryProducts.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryProducts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryProductsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await inventoryProducts.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryProducts/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get inventoryproducts by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryProducts' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await inventoryProducts.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InventoryProducts/1');
    });
  });

  describe('create', () => {
    it('should create inventoryproducts successfully', async () => {
      const inventoryProductsData = { name: 'New InventoryProducts' };
      const mockResponse = { id: 1, ...inventoryProductsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await inventoryProducts.create(inventoryProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/InventoryProducts', inventoryProductsData);
    });
  });

  describe('update', () => {
    it('should update inventoryproducts successfully', async () => {
      const inventoryProductsData = { name: 'Updated InventoryProducts' };
      const mockResponse = { id: 1, ...inventoryProductsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await inventoryProducts.update(1, inventoryProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/InventoryProducts/1', inventoryProductsData);
    });
  });

  describe('patch', () => {
    it('should partially update inventoryproducts successfully', async () => {
      const inventoryProductsData = { name: 'Patched InventoryProducts' };
      const mockResponse = { id: 1, ...inventoryProductsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await inventoryProducts.patch(1, inventoryProductsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/InventoryProducts/1', inventoryProductsData);
    });
  });

  describe('delete', () => {
    it('should delete inventoryproducts successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await inventoryProducts.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/InventoryProducts/1');
    });
  });
});