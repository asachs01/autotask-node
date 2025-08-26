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
  ResourceRoleQueues,
  IResourceRoleQueues,
  IResourceRoleQueuesQuery,
} from '../../src/entities/resourcerolequeues';

describe('ResourceRoleQueues Entity', () => {
  let resourceRoleQueues: ResourceRoleQueues;
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

    resourceRoleQueues = new ResourceRoleQueues(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourcerolequeues successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceRoleQueues 1' },
        { id: 2, name: 'ResourceRoleQueues 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceRoleQueues.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceRoleQueues/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IResourceRoleQueuesQuery = {
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

      await resourceRoleQueues.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceRoleQueues/query', {
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
    it('should get resourcerolequeues by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceRoleQueues' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceRoleQueues.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceRoleQueues/1');
    });
  });

  describe('create', () => {
    it('should create resourcerolequeues successfully', async () => {
      const resourceRoleQueuesData = { name: 'New ResourceRoleQueues' };
      const mockResponse = { id: 1, ...resourceRoleQueuesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await resourceRoleQueues.create(resourceRoleQueuesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ResourceRoleQueues', resourceRoleQueuesData);
    });
  });

  describe('delete', () => {
    it('should delete resourcerolequeues successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await resourceRoleQueues.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ResourceRoleQueues/1');
    });
  });
});