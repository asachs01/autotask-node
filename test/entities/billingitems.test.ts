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
  BillingItems,
  IBillingItems,
  IBillingItemsQuery,
} from '../../src/entities/billingitems';

describe('BillingItems Entity', () => {
  let billingItems: BillingItems;
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

    billingItems = new BillingItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list billingitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'BillingItems 1' },
        { id: 2, name: 'BillingItems 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await billingItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/BillingItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IBillingItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await billingItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/BillingItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get billingitems by id', async () => {
      const mockData = { id: 1, name: 'Test BillingItems' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await billingItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/BillingItems/1');
    });
  });

  describe('create', () => {
    it('should create billingitems successfully', async () => {
      const billingItemsData = { name: 'New BillingItems' };
      const mockResponse = { id: 1, ...billingItemsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await billingItems.create(billingItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/BillingItems',
        billingItemsData
      );
    });
  });

  describe('update', () => {
    it('should update billingitems successfully', async () => {
      const billingItemsData = { name: 'Updated BillingItems' };
      const mockResponse = { id: 1, ...billingItemsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await billingItems.update(1, billingItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/BillingItems/1',
        billingItemsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update billingitems successfully', async () => {
      const billingItemsData = { name: 'Patched BillingItems' };
      const mockResponse = { id: 1, ...billingItemsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await billingItems.patch(1, billingItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/BillingItems/1',
        billingItemsData
      );
    });
  });

  describe('delete', () => {
    it('should delete billingitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await billingItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/BillingItems/1');
    });
  });
});
