import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import {
  TaskPredecessors,
  ITaskPredecessors,
  ITaskPredecessorsQuery,
} from '../../src/entities/taskpredecessors';

describe('TaskPredecessors Entity', () => {
  let taskPredecessors: TaskPredecessors;
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

    taskPredecessors = new TaskPredecessors(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list taskpredecessors successfully', async () => {
      const mockData = [
        { id: 1, name: 'TaskPredecessors 1' },
        { id: 2, name: 'TaskPredecessors 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await taskPredecessors.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TaskPredecessors/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITaskPredecessorsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await taskPredecessors.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TaskPredecessors/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('get', () => {
    it('should get taskpredecessors by id', async () => {
      const mockData = { id: 1, name: 'Test TaskPredecessors' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await taskPredecessors.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TaskPredecessors/1');
    });
  });

  describe('create', () => {
    it('should create taskpredecessors successfully', async () => {
      const taskPredecessorsData = { name: 'New TaskPredecessors' };
      const mockResponse = { id: 1, ...taskPredecessorsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await taskPredecessors.create(taskPredecessorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TaskPredecessors', taskPredecessorsData);
    });
  });

  describe('delete', () => {
    it('should delete taskpredecessors successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await taskPredecessors.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TaskPredecessors/1');
    });
  });
});