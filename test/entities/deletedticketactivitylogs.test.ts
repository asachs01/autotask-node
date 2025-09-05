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
  DeletedTicketActivityLogs,
  IDeletedTicketActivityLogs,
  IDeletedTicketActivityLogsQuery,
} from '../../src/entities/deletedticketactivitylogs';

describe('DeletedTicketActivityLogs Entity', () => {
  let deletedTicketActivityLogs: DeletedTicketActivityLogs;
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

    deletedTicketActivityLogs = new DeletedTicketActivityLogs(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list deletedticketactivitylogs successfully', async () => {
      const mockData = [
        { id: 1, name: 'DeletedTicketActivityLogs 1' },
        { id: 2, name: 'DeletedTicketActivityLogs 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await deletedTicketActivityLogs.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/DeletedTicketActivityLogs/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IDeletedTicketActivityLogsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await deletedTicketActivityLogs.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/DeletedTicketActivityLogs/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get deletedticketactivitylogs by id', async () => {
      const mockData = { id: 1, name: 'Test DeletedTicketActivityLogs' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await deletedTicketActivityLogs.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/DeletedTicketActivityLogs/1');
    });
  });
});