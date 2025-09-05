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
  TaskNotes,
  ITaskNotes,
  ITaskNotesQuery,
} from '../../src/entities/tasknotes';

describe('TaskNotes Entity', () => {
  let taskNotes: TaskNotes;
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

    taskNotes = new TaskNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list tasknotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'TaskNotes 1' },
        { id: 2, name: 'TaskNotes 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await taskNotes.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TaskNotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITaskNotesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await taskNotes.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TaskNotes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get tasknotes by id', async () => {
      const mockData = { id: 1, name: 'Test TaskNotes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await taskNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TaskNotes/1');
    });
  });

  describe('create', () => {
    it('should create tasknotes successfully', async () => {
      const taskNotesData = { name: 'New TaskNotes' };
      const mockResponse = { id: 1, ...taskNotesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await taskNotes.create(taskNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TaskNotes', taskNotesData);
    });
  });

  describe('update', () => {
    it('should update tasknotes successfully', async () => {
      const taskNotesData = { name: 'Updated TaskNotes' };
      const mockResponse = { id: 1, ...taskNotesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await taskNotes.update(1, taskNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/TaskNotes/1', taskNotesData);
    });
  });

  describe('patch', () => {
    it('should partially update tasknotes successfully', async () => {
      const taskNotesData = { name: 'Patched TaskNotes' };
      const mockResponse = { id: 1, ...taskNotesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await taskNotes.patch(1, taskNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/TaskNotes/1', taskNotesData);
    });
  });
});