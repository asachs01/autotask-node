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
  PurchaseOrders,
  IPurchaseOrders,
  IPurchaseOrdersQuery,
} from '../../src/entities/purchaseorders';

describe('PurchaseOrders Entity', () => {
  let purchaseOrders: PurchaseOrders;
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

    purchaseOrders = new PurchaseOrders(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list purchaseorders successfully', async () => {
      const mockData = [
        { id: 1, name: 'PurchaseOrders 1' },
        { id: 2, name: 'PurchaseOrders 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await purchaseOrders.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IPurchaseOrdersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await purchaseOrders.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get purchaseorders by id', async () => {
      const mockData = { id: 1, name: 'Test PurchaseOrders' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await purchaseOrders.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PurchaseOrders/1');
    });
  });

  describe('create', () => {
    it('should create purchaseorders successfully', async () => {
      const purchaseOrdersData = { name: 'New PurchaseOrders' };
      const mockResponse = { id: 1, ...purchaseOrdersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await purchaseOrders.create(purchaseOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PurchaseOrders', purchaseOrdersData);
    });
  });

  describe('update', () => {
    it('should update purchaseorders successfully', async () => {
      const purchaseOrdersData = { name: 'Updated PurchaseOrders' };
      const mockResponse = { id: 1, ...purchaseOrdersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await purchaseOrders.update(1, purchaseOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/PurchaseOrders/1', purchaseOrdersData);
    });
  });

  describe('patch', () => {
    it('should partially update purchaseorders successfully', async () => {
      const purchaseOrdersData = { name: 'Patched PurchaseOrders' };
      const mockResponse = { id: 1, ...purchaseOrdersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await purchaseOrders.patch(1, purchaseOrdersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/PurchaseOrders/1', purchaseOrdersData);
    });
  });
});