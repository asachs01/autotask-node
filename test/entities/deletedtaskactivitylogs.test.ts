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
  DeletedTaskActivityLogs,
  IDeletedTaskActivityLogs,
  IDeletedTaskActivityLogsQuery,
} from '../../src/entities/deletedtaskactivitylogs';

describe('DeletedTaskActivityLogs Entity', () => {
  let deletedTaskActivityLogs: DeletedTaskActivityLogs;
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

    deletedTaskActivityLogs = new DeletedTaskActivityLogs(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list deletedtaskactivitylogs successfully', async () => {
      const mockData = [
        { id: 1, name: 'DeletedTaskActivityLogs 1' },
        { id: 2, name: 'DeletedTaskActivityLogs 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await deletedTaskActivityLogs.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/DeletedTaskActivityLogs/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IDeletedTaskActivityLogsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await deletedTaskActivityLogs.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/DeletedTaskActivityLogs/query',
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
    it('should get deletedtaskactivitylogs by id', async () => {
      const mockData = { id: 1, name: 'Test DeletedTaskActivityLogs' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await deletedTaskActivityLogs.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/DeletedTaskActivityLogs/1');
    });
  });
});
