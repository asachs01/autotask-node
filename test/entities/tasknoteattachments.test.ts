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
  TaskNoteAttachments,
  ITaskNoteAttachments,
  ITaskNoteAttachmentsQuery,
} from '../../src/entities/tasknoteattachments';

describe('TaskNoteAttachments Entity', () => {
  let taskNoteAttachments: TaskNoteAttachments;
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

    taskNoteAttachments = new TaskNoteAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list tasknoteattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'TaskNoteAttachments 1' },
        { id: 2, name: 'TaskNoteAttachments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await taskNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TaskNoteAttachments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITaskNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await taskNoteAttachments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TaskNoteAttachments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get tasknoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test TaskNoteAttachments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await taskNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TaskNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create tasknoteattachments successfully', async () => {
      const taskNoteAttachmentsData = { name: 'New TaskNoteAttachments' };
      const mockResponse = { id: 1, ...taskNoteAttachmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await taskNoteAttachments.create(taskNoteAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/TaskNoteAttachments', taskNoteAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete tasknoteattachments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await taskNoteAttachments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TaskNoteAttachments/1');
    });
  });
});