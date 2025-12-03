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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await serviceCallTasks.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTasks/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallTasksQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await serviceCallTasks.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTasks/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get servicecalltasks by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCallTasks' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await serviceCallTasks.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTasks/1');
    });
  });

  describe('create', () => {
    it('should create servicecalltasks successfully', async () => {
      const serviceCallTasksData = { name: 'New ServiceCallTasks' };
      const mockResponse = { id: 1, ...serviceCallTasksData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await serviceCallTasks.create(serviceCallTasksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ServiceCallTasks',
        serviceCallTasksData
      );
    });
  });

  describe('update', () => {
    it('should update servicecalltasks successfully', async () => {
      const serviceCallTasksData = { name: 'Updated ServiceCallTasks' };
      const mockResponse = { id: 1, ...serviceCallTasksData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await serviceCallTasks.update(1, serviceCallTasksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ServiceCallTasks/1',
        serviceCallTasksData
      );
    });
  });

  describe('patch', () => {
    it('should partially update servicecalltasks successfully', async () => {
      const serviceCallTasksData = { name: 'Patched ServiceCallTasks' };
      const mockResponse = { id: 1, ...serviceCallTasksData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await serviceCallTasks.patch(1, serviceCallTasksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ServiceCallTasks/1',
        serviceCallTasksData
      );
    });
  });

  describe('delete', () => {
    it('should delete servicecalltasks successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await serviceCallTasks.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ServiceCallTasks/1');
    });
  });
});
