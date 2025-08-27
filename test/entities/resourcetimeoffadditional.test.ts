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
  ResourceTimeOffAdditional,
  IResourceTimeOffAdditional,
  IResourceTimeOffAdditionalQuery,
} from '../../src/entities/resourcetimeoffadditional';

describe('ResourceTimeOffAdditional Entity', () => {
  let resourceTimeOffAdditional: ResourceTimeOffAdditional;
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

    resourceTimeOffAdditional = new ResourceTimeOffAdditional(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourcetimeoffadditional successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceTimeOffAdditional 1' },
        { id: 2, name: 'ResourceTimeOffAdditional 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceTimeOffAdditional.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceTimeOffAdditional/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IResourceTimeOffAdditionalQuery = {
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

      await resourceTimeOffAdditional.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceTimeOffAdditional/query', {
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
    it('should get resourcetimeoffadditional by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceTimeOffAdditional' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceTimeOffAdditional.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceTimeOffAdditional/1');
    });
  });

  describe('create', () => {
    it('should create resourcetimeoffadditional successfully', async () => {
      const resourceTimeOffAdditionalData = { name: 'New ResourceTimeOffAdditional' };
      const mockResponse = { id: 1, ...resourceTimeOffAdditionalData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await resourceTimeOffAdditional.create(resourceTimeOffAdditionalData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ResourceTimeOffAdditional', resourceTimeOffAdditionalData);
    });
  });

  describe('update', () => {
    it('should update resourcetimeoffadditional successfully', async () => {
      const resourceTimeOffAdditionalData = { name: 'Updated ResourceTimeOffAdditional' };
      const mockResponse = { id: 1, ...resourceTimeOffAdditionalData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceTimeOffAdditional.update(1, resourceTimeOffAdditionalData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ResourceTimeOffAdditional/1', resourceTimeOffAdditionalData);
    });
  });

  describe('patch', () => {
    it('should partially update resourcetimeoffadditional successfully', async () => {
      const resourceTimeOffAdditionalData = { name: 'Patched ResourceTimeOffAdditional' };
      const mockResponse = { id: 1, ...resourceTimeOffAdditionalData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceTimeOffAdditional.patch(1, resourceTimeOffAdditionalData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ResourceTimeOffAdditional/1', resourceTimeOffAdditionalData);
    });
  });

  describe('delete', () => {
    it('should delete resourcetimeoffadditional successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await resourceTimeOffAdditional.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ResourceTimeOffAdditional/1');
    });
  });
});