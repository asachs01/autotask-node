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
  ResourceServiceDeskRoles,
  IResourceServiceDeskRoles,
  IResourceServiceDeskRolesQuery,
} from '../../src/entities/resourceservicedeskroles';

describe('ResourceServiceDeskRoles Entity', () => {
  let resourceServiceDeskRoles: ResourceServiceDeskRoles;
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

    resourceServiceDeskRoles = new ResourceServiceDeskRoles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourceservicedeskroles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceServiceDeskRoles 1' },
        { id: 2, name: 'ResourceServiceDeskRoles 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await resourceServiceDeskRoles.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceServiceDeskRoles/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IResourceServiceDeskRolesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await resourceServiceDeskRoles.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceServiceDeskRoles/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get resourceservicedeskroles by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceServiceDeskRoles' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await resourceServiceDeskRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ResourceServiceDeskRoles/1');
    });
  });

  describe('create', () => {
    it('should create resourceservicedeskroles successfully', async () => {
      const resourceServiceDeskRolesData = { name: 'New ResourceServiceDeskRoles' };
      const mockResponse = { id: 1, ...resourceServiceDeskRolesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await resourceServiceDeskRoles.create(resourceServiceDeskRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ResourceServiceDeskRoles', resourceServiceDeskRolesData);
    });
  });

  describe('delete', () => {
    it('should delete resourceservicedeskroles successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await resourceServiceDeskRoles.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ResourceServiceDeskRoles/1');
    });
  });
});