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
  Resources,
  IResources,
  IResourcesQuery,
} from '../../src/entities/resources';

describe('Resources Entity', () => {
  let resources: Resources;
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

    resources = new Resources(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resources successfully', async () => {
      const mockData = [
        { id: 1, name: 'Resources 1' },
        { id: 2, name: 'Resources 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resources.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Resources/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        },
      });
    });

    it('should handle query parameters', async () => {
      const query: IResourcesQuery = {
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

      await resources.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/Resources/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  describe('get', () => {
    it('should get resources by id', async () => {
      const mockData = { id: 1, name: 'Test Resources' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resources.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Resources/1');
    });
  });

  describe('create', () => {
    it('should create resources successfully', async () => {
      const resourcesData = { name: 'New Resources' };
      const mockResponse = { id: 1, ...resourcesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await resources.create(resourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/Resources', resourcesData);
    });
  });

  describe('update', () => {
    it('should update resources successfully', async () => {
      const resourcesData = { name: 'Updated Resources' };
      const mockResponse = { id: 1, ...resourcesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resources.update(1, resourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/Resources/1', resourcesData);
    });
  });

  describe('patch', () => {
    it('should partially update resources successfully', async () => {
      const resourcesData = { name: 'Patched Resources' };
      const mockResponse = { id: 1, ...resourcesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resources.patch(1, resourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/Resources/1',
        resourcesData
      );
    });
  });
});
