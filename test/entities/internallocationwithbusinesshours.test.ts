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
  InternalLocationWithBusinessHours,
  IInternalLocationWithBusinessHours,
  IInternalLocationWithBusinessHoursQuery,
} from '../../src/entities/internallocationwithbusinesshours';

describe('InternalLocationWithBusinessHours Entity', () => {
  let internalLocationWithBusinessHours: InternalLocationWithBusinessHours;
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

    internalLocationWithBusinessHours = new InternalLocationWithBusinessHours(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list internallocationwithbusinesshours successfully', async () => {
      const mockData = [
        { id: 1, name: 'InternalLocationWithBusinessHours 1' },
        { id: 2, name: 'InternalLocationWithBusinessHours 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await internalLocationWithBusinessHours.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InternalLocationWithBusinessHours/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IInternalLocationWithBusinessHoursQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await internalLocationWithBusinessHours.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InternalLocationWithBusinessHours/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get internallocationwithbusinesshours by id', async () => {
      const mockData = { id: 1, name: 'Test InternalLocationWithBusinessHours' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await internalLocationWithBusinessHours.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InternalLocationWithBusinessHours/1');
    });
  });
});