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
  BillingItemApprovalLevels,
  IBillingItemApprovalLevels,
  IBillingItemApprovalLevelsQuery,
} from '../../src/entities/billingitemapprovallevels';

describe('BillingItemApprovalLevels Entity', () => {
  let billingItemApprovalLevels: BillingItemApprovalLevels;
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

    billingItemApprovalLevels = new BillingItemApprovalLevels(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list billingitemapprovallevels successfully', async () => {
      const mockData = [
        { id: 1, name: 'BillingItemApprovalLevels 1' },
        { id: 2, name: 'BillingItemApprovalLevels 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await billingItemApprovalLevels.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/BillingItemApprovalLevels/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IBillingItemApprovalLevelsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await billingItemApprovalLevels.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/BillingItemApprovalLevels/query',
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
    it('should get billingitemapprovallevels by id', async () => {
      const mockData = { id: 1, name: 'Test BillingItemApprovalLevels' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await billingItemApprovalLevels.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/BillingItemApprovalLevels/1'
      );
    });
  });
});
