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
  SalesOrders,
  ISalesOrders,
  ISalesOrdersQuery,
} from '../../src/entities/salesorders';

describe('SalesOrders Entity', () => {
  let salesOrders: SalesOrders;
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

    salesOrders = new SalesOrders(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list salesorders successfully', async () => {
      const mockData = [
        { id: 1, name: 'SalesOrders 1' },
        { id: 2, name: 'SalesOrders 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await salesOrders.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/SalesOrders/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ISalesOrdersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await salesOrders.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/SalesOrders/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get salesorders by id', async () => {
      const mockData = { id: 1, name: 'Test SalesOrders' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await salesOrders.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/SalesOrders/1');
    });
  });

  describe('create', () => {
    it('should create salesorders successfully', async () => {
      const salesOrdersData = { name: 'New SalesOrders' };
      const mockResponse = { id: 1, ...salesOrdersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await salesOrders.create(salesOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/SalesOrders', salesOrdersData);
    });
  });

  describe('update', () => {
    it('should update salesorders successfully', async () => {
      const salesOrdersData = { name: 'Updated SalesOrders' };
      const mockResponse = { id: 1, ...salesOrdersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await salesOrders.update(1, salesOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/SalesOrders/1', salesOrdersData);
    });
  });

  describe('patch', () => {
    it('should partially update salesorders successfully', async () => {
      const salesOrdersData = { name: 'Patched SalesOrders' };
      const mockResponse = { id: 1, ...salesOrdersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await salesOrders.patch(1, salesOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/SalesOrders/1', salesOrdersData);
    });
  });
});