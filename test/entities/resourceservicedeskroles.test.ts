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

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceServiceDeskRoles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceServiceDeskRoles/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IResourceServiceDeskRolesQuery = {
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

      await resourceServiceDeskRoles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceServiceDeskRoles/query', {
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
    it('should get resourceservicedeskroles by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceServiceDeskRoles' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceServiceDeskRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceServiceDeskRoles/1');
    });
  });

  describe('create', () => {
    it('should create resourceservicedeskroles successfully', async () => {
      const resourceServiceDeskRolesData = { name: 'New ResourceServiceDeskRoles' };
      const mockResponse = { id: 1, ...resourceServiceDeskRolesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await resourceServiceDeskRoles.create(resourceServiceDeskRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ResourceServiceDeskRoles', resourceServiceDeskRolesData);
    });
  });

  describe('delete', () => {
    it('should delete resourceservicedeskroles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await resourceServiceDeskRoles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ResourceServiceDeskRoles/1');
    });
  });
});