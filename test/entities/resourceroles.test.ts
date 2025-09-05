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
  ResourceRoles,
  IResourceRoles,
  IResourceRolesQuery,
} from '../../src/entities/resourceroles';

describe('ResourceRoles Entity', () => {
  let resourceRoles: ResourceRoles;
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

    resourceRoles = new ResourceRoles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourceroles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceRoles 1' },
        { id: 2, name: 'ResourceRoles 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await resourceRoles.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceRoles/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IResourceRolesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await resourceRoles.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceRoles/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get resourceroles by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceRoles' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await resourceRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceRoles/1');
    });
  });

  describe('create', () => {
    it('should create resourceroles successfully', async () => {
      const resourceRolesData = { name: 'New ResourceRoles' };
      const mockResponse = { id: 1, ...resourceRolesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await resourceRoles.create(resourceRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ResourceRoles', resourceRolesData);
    });
  });

  describe('delete', () => {
    it('should delete resourceroles successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await resourceRoles.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ResourceRoles/1');
    });
  });
});