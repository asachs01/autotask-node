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
  ProductVendors,
  IProductVendors,
  IProductVendorsQuery,
} from '../../src/entities/productvendors';

describe('ProductVendors Entity', () => {
  let productVendors: ProductVendors;
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

    productVendors = new ProductVendors(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list productvendors successfully', async () => {
      const mockData = [
        { id: 1, name: 'ProductVendors 1' },
        { id: 2, name: 'ProductVendors 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await productVendors.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProductVendors/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IProductVendorsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await productVendors.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ProductVendors/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get productvendors by id', async () => {
      const mockData = { id: 1, name: 'Test ProductVendors' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await productVendors.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProductVendors/1');
    });
  });

  describe('create', () => {
    it('should create productvendors successfully', async () => {
      const productVendorsData = { name: 'New ProductVendors' };
      const mockResponse = { id: 1, ...productVendorsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await productVendors.create(productVendorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ProductVendors',
        productVendorsData
      );
    });
  });

  describe('update', () => {
    it('should update productvendors successfully', async () => {
      const productVendorsData = { name: 'Updated ProductVendors' };
      const mockResponse = { id: 1, ...productVendorsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await productVendors.update(1, productVendorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ProductVendors/1',
        productVendorsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update productvendors successfully', async () => {
      const productVendorsData = { name: 'Patched ProductVendors' };
      const mockResponse = { id: 1, ...productVendorsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await productVendors.patch(1, productVendorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ProductVendors/1',
        productVendorsData
      );
    });
  });

  describe('delete', () => {
    it('should delete productvendors successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await productVendors.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ProductVendors/1');
    });
  });
});
