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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await priceListMaterialCodes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/PriceListMaterialCodes/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IPriceListMaterialCodesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await priceListMaterialCodes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/PriceListMaterialCodes/query',
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
    it('should get pricelistmaterialcodes by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListMaterialCodes' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await priceListMaterialCodes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/PriceListMaterialCodes/1');
    });
  });

  describe('create', () => {
    it('should create pricelistmaterialcodes successfully', async () => {
      const priceListMaterialCodesData = { name: 'New PriceListMaterialCodes' };
      const mockResponse = { id: 1, ...priceListMaterialCodesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await priceListMaterialCodes.create(
        priceListMaterialCodesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/PriceListMaterialCodes',
        priceListMaterialCodesData
      );
    });
  });

  describe('update', () => {
    it('should update pricelistmaterialcodes successfully', async () => {
      const priceListMaterialCodesData = {
        name: 'Updated PriceListMaterialCodes',
      };
      const mockResponse = { id: 1, ...priceListMaterialCodesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await priceListMaterialCodes.update(
        1,
        priceListMaterialCodesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/PriceListMaterialCodes/1',
        priceListMaterialCodesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update pricelistmaterialcodes successfully', async () => {
      const priceListMaterialCodesData = {
        name: 'Patched PriceListMaterialCodes',
      };
      const mockResponse = { id: 1, ...priceListMaterialCodesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await priceListMaterialCodes.patch(
        1,
        priceListMaterialCodesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/PriceListMaterialCodes/1',
        priceListMaterialCodesData
      );
    });
  });

  describe('delete', () => {
    it('should delete pricelistmaterialcodes successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await priceListMaterialCodes.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/PriceListMaterialCodes/1'
      );
    });
  });
});
