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
  PurchaseOrderItemReceiving,
  IPurchaseOrderItemReceiving,
  IPurchaseOrderItemReceivingQuery,
} from '../../src/entities/purchaseorderitemreceiving';

describe('PurchaseOrderItemReceiving Entity', () => {
  let purchaseOrderItemReceiving: PurchaseOrderItemReceiving;
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

    purchaseOrderItemReceiving = new PurchaseOrderItemReceiving(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list purchaseorderitemreceiving successfully', async () => {
      const mockData = [
        { id: 1, name: 'PurchaseOrderItemReceiving 1' },
        { id: 2, name: 'PurchaseOrderItemReceiving 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await purchaseOrderItemReceiving.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/PurchaseOrderItemReceiving/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IPurchaseOrderItemReceivingQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await purchaseOrderItemReceiving.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/PurchaseOrderItemReceiving/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get purchaseorderitemreceiving by id', async () => {
      const mockData = { id: 1, name: 'Test PurchaseOrderItemReceiving' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await purchaseOrderItemReceiving.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/PurchaseOrderItemReceiving/1'
      );
    });
  });

  describe('create', () => {
    it('should create purchaseorderitemreceiving successfully', async () => {
      const purchaseOrderItemReceivingData = {
        name: 'New PurchaseOrderItemReceiving',
      };
      const mockResponse = { id: 1, ...purchaseOrderItemReceivingData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await purchaseOrderItemReceiving.create(
        purchaseOrderItemReceivingData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/PurchaseOrderItemReceiving',
        purchaseOrderItemReceivingData
      );
    });
  });

  describe('update', () => {
    it('should update purchaseorderitemreceiving successfully', async () => {
      const purchaseOrderItemReceivingData = {
        name: 'Updated PurchaseOrderItemReceiving',
      };
      const mockResponse = { id: 1, ...purchaseOrderItemReceivingData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await purchaseOrderItemReceiving.update(
        1,
        purchaseOrderItemReceivingData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/PurchaseOrderItemReceiving/1',
        purchaseOrderItemReceivingData
      );
    });
  });

  describe('patch', () => {
    it('should partially update purchaseorderitemreceiving successfully', async () => {
      const purchaseOrderItemReceivingData = {
        name: 'Patched PurchaseOrderItemReceiving',
      };
      const mockResponse = { id: 1, ...purchaseOrderItemReceivingData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await purchaseOrderItemReceiving.patch(
        1,
        purchaseOrderItemReceivingData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/PurchaseOrderItemReceiving/1',
        purchaseOrderItemReceivingData
      );
    });
  });
});
