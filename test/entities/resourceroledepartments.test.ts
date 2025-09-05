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
  ResourceRoleDepartments,
  IResourceRoleDepartments,
  IResourceRoleDepartmentsQuery,
} from '../../src/entities/resourceroledepartments';

describe('ResourceRoleDepartments Entity', () => {
  let resourceRoleDepartments: ResourceRoleDepartments;
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

    resourceRoleDepartments = new ResourceRoleDepartments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourceroledepartments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceRoleDepartments 1' },
        { id: 2, name: 'ResourceRoleDepartments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await resourceRoleDepartments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceRoleDepartments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IResourceRoleDepartmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await resourceRoleDepartments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceRoleDepartments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get resourceroledepartments by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceRoleDepartments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await resourceRoleDepartments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceRoleDepartments/1');
    });
  });

  describe('create', () => {
    it('should create resourceroledepartments successfully', async () => {
      const resourceRoleDepartmentsData = { name: 'New ResourceRoleDepartments' };
      const mockResponse = { id: 1, ...resourceRoleDepartmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await resourceRoleDepartments.create(resourceRoleDepartmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ResourceRoleDepartments', resourceRoleDepartmentsData);
    });
  });

  describe('delete', () => {
    it('should delete resourceroledepartments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await resourceRoleDepartments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ResourceRoleDepartments/1');
    });
  });
});