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
  PriceListServiceBundles,
  IPriceListServiceBundles,
  IPriceListServiceBundlesQuery,
} from '../../src/entities/pricelistservicebundles';

describe('PriceListServiceBundles Entity', () => {
  let priceListServiceBundles: PriceListServiceBundles;
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

    priceListServiceBundles = new PriceListServiceBundles(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list pricelistservicebundles successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListServiceBundles 1' },
        { id: 2, name: 'PriceListServiceBundles 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await priceListServiceBundles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/PriceListServiceBundles/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IPriceListServiceBundlesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await priceListServiceBundles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/PriceListServiceBundles/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get pricelistservicebundles by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListServiceBundles' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await priceListServiceBundles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListServiceBundles/1');
    });
  });

  describe('create', () => {
    it('should create pricelistservicebundles successfully', async () => {
      const priceListServiceBundlesData = {
        name: 'New PriceListServiceBundles',
      };
      const mockResponse = { id: 1, ...priceListServiceBundlesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await priceListServiceBundles.create(
        priceListServiceBundlesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/PriceListServiceBundles',
        priceListServiceBundlesData
      );
    });
  });

  describe('update', () => {
    it('should update pricelistservicebundles successfully', async () => {
      const priceListServiceBundlesData = {
        name: 'Updated PriceListServiceBundles',
      };
      const mockResponse = { id: 1, ...priceListServiceBundlesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await priceListServiceBundles.update(
        1,
        priceListServiceBundlesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/PriceListServiceBundles/1',
        priceListServiceBundlesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update pricelistservicebundles successfully', async () => {
      const priceListServiceBundlesData = {
        name: 'Patched PriceListServiceBundles',
      };
      const mockResponse = { id: 1, ...priceListServiceBundlesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListServiceBundles.patch(
        1,
        priceListServiceBundlesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/PriceListServiceBundles/1',
        priceListServiceBundlesData
      );
    });
  });

  describe('delete', () => {
    it('should delete pricelistservicebundles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await priceListServiceBundles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/PriceListServiceBundles/1'
      );
    });
  });
});
