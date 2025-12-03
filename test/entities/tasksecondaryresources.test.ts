import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import winston from 'winston';
import {
  TaskSecondaryResources,
  ITaskSecondaryResources,
  ITaskSecondaryResourcesQuery,
} from '../../src/entities/tasksecondaryresources';

describe('TaskSecondaryResources Entity', () => {
  let taskSecondaryResources: TaskSecondaryResources;
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

    taskSecondaryResources = new TaskSecondaryResources(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list tasksecondaryresources successfully', async () => {
      const mockData = [
        { id: 1, name: 'TaskSecondaryResources 1' },
        { id: 2, name: 'TaskSecondaryResources 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await taskSecondaryResources.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TaskSecondaryResources/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ITaskSecondaryResourcesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await taskSecondaryResources.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TaskSecondaryResources/query',
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
    it('should get tasksecondaryresources by id', async () => {
      const mockData = { id: 1, name: 'Test TaskSecondaryResources' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await taskSecondaryResources.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TaskSecondaryResources/1');
    });
  });

  describe('create', () => {
    it('should create tasksecondaryresources successfully', async () => {
      const taskSecondaryResourcesData = { name: 'New TaskSecondaryResources' };
      const mockResponse = { id: 1, ...taskSecondaryResourcesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await taskSecondaryResources.create(
        taskSecondaryResourcesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TaskSecondaryResources',
        taskSecondaryResourcesData
      );
    });
  });

  describe('delete', () => {
    it('should delete tasksecondaryresources successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await taskSecondaryResources.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/TaskSecondaryResources/1'
      );
    });
  });
});
