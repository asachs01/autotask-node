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
  DeletedTicketLogs,
  IDeletedTicketLogs,
  IDeletedTicketLogsQuery,
} from '../../src/entities/deletedticketlogs';

describe('DeletedTicketLogs Entity', () => {
  let deletedTicketLogs: DeletedTicketLogs;
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

    deletedTicketLogs = new DeletedTicketLogs(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list deletedticketlogs successfully', async () => {
      const mockData = [
        { id: 1, name: 'DeletedTicketLogs 1' },
        { id: 2, name: 'DeletedTicketLogs 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await deletedTicketLogs.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/DeletedTicketLogs/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IDeletedTicketLogsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await deletedTicketLogs.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/DeletedTicketLogs/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get deletedticketlogs by id', async () => {
      const mockData = { id: 1, name: 'Test DeletedTicketLogs' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await deletedTicketLogs.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DeletedTicketLogs/1');
    });
  });
});
