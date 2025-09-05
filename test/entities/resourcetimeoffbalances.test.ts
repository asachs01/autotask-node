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
  ResourceTimeOffBalances,
  IResourceTimeOffBalances,
  IResourceTimeOffBalancesQuery,
} from '../../src/entities/resourcetimeoffbalances';

describe('ResourceTimeOffBalances Entity', () => {
  let resourceTimeOffBalances: ResourceTimeOffBalances;
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

    resourceTimeOffBalances = new ResourceTimeOffBalances(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourcetimeoffbalances successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceTimeOffBalances 1' },
        { id: 2, name: 'ResourceTimeOffBalances 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await resourceTimeOffBalances.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceTimeOffBalances/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IResourceTimeOffBalancesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await resourceTimeOffBalances.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceTimeOffBalances/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get resourcetimeoffbalances by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceTimeOffBalances' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await resourceTimeOffBalances.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceTimeOffBalances/1');
    });
  });
});