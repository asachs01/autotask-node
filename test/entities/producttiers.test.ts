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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await productTiers.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProductTiers/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IProductTiersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await productTiers.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProductTiers/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get producttiers by id', async () => {
      const mockData = { id: 1, name: 'Test ProductTiers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await productTiers.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProductTiers/1');
    });
  });

  describe('create', () => {
    it('should create producttiers successfully', async () => {
      const productTiersData = { name: 'New ProductTiers' };
      const mockResponse = { id: 1, ...productTiersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await productTiers.create(productTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ProductTiers', productTiersData);
    });
  });

  describe('update', () => {
    it('should update producttiers successfully', async () => {
      const productTiersData = { name: 'Updated ProductTiers' };
      const mockResponse = { id: 1, ...productTiersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await productTiers.update(1, productTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ProductTiers/1', productTiersData);
    });
  });

  describe('patch', () => {
    it('should partially update producttiers successfully', async () => {
      const productTiersData = { name: 'Patched ProductTiers' };
      const mockResponse = { id: 1, ...productTiersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await productTiers.patch(1, productTiersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ProductTiers/1', productTiersData);
    });
  });

  describe('delete', () => {
    it('should delete producttiers successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await productTiers.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ProductTiers/1');
    });
  });
});