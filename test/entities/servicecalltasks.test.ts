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
  ServiceCallTasks,
  IServiceCallTasks,
  IServiceCallTasksQuery,
} from '../../src/entities/servicecalltasks';

describe('ServiceCallTasks Entity', () => {
  let serviceCallTasks: ServiceCallTasks;
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

    serviceCallTasks = new ServiceCallTasks(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicecalltasks successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceCallTasks 1' },
        { id: 2, name: 'ServiceCallTasks 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTasks.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTasks/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallTasksQuery = {
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

      await serviceCallTasks.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTasks/query', {
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
    it('should get servicecalltasks by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCallTasks' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTasks.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTasks/1');
    });
  });

  describe('create', () => {
    it('should create servicecalltasks successfully', async () => {
      const serviceCallTasksData = { name: 'New ServiceCallTasks' };
      const mockResponse = { id: 1, ...serviceCallTasksData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTasks.create(serviceCallTasksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ServiceCallTasks', serviceCallTasksData);
    });
  });

  describe('update', () => {
    it('should update servicecalltasks successfully', async () => {
      const serviceCallTasksData = { name: 'Updated ServiceCallTasks' };
      const mockResponse = { id: 1, ...serviceCallTasksData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTasks.update(1, serviceCallTasksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ServiceCallTasks/1', serviceCallTasksData);
    });
  });

  describe('patch', () => {
    it('should partially update servicecalltasks successfully', async () => {
      const serviceCallTasksData = { name: 'Patched ServiceCallTasks' };
      const mockResponse = { id: 1, ...serviceCallTasksData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTasks.patch(1, serviceCallTasksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ServiceCallTasks/1', serviceCallTasksData);
    });
  });

  describe('delete', () => {
    it('should delete servicecalltasks successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await serviceCallTasks.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ServiceCallTasks/1');
    });
  });
});