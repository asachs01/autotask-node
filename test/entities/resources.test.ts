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
  Resource,
  ResourceQuery,
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
        { id: 1, name: 'Resource 1' },
        { id: 2, name: 'Resource 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse);

      const result = await resources.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Resources', { params: {} });
    });

    it('should handle query parameters', async () => {
      const mockData = [{ id: 1, name: 'Filtered Resource' }];
      const query: ResourceQuery = {
        filter: { name: 'test' },
        sort: 'name',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse);

      const result = await resources.list(query);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Resources', {
        params: {
          search: JSON.stringify(query.filter),
          sort: query.sort,
          page: query.page,
          pageSize: query.pageSize,
        },
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(resources.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should get a resource by ID', async () => {
      const mockResource = { id: 1, name: 'Test Resource' };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResource,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse);

      const result = await resources.get(1);

      expect(result.data).toEqual(mockResource);
      expect(mockAxios.get).toHaveBeenCalledWith('/Resources/1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Resource not found');
      mockAxios.get.mockRejectedValue(error);

      await expect(resources.get(999)).rejects.toThrow('Resource not found');
    });
  });

  describe('create', () => {
    it('should create a new resource', async () => {
      const newResource: Resource = {
        name: 'New Resource',
        email: 'test@example.com',
      };
      const createdResource = { id: 1, ...newResource };

      mockAxios.post.mockResolvedValueOnce({
        data: createdResource,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {},
      } as AxiosResponse);

      const result = await resources.create(newResource);

      expect(result.data).toEqual(createdResource);
      expect(mockAxios.post).toHaveBeenCalledWith('/Resources', newResource);
    });

    it('should handle validation errors', async () => {
      const invalidResource: Resource = { name: '' };
      const error = new Error('Validation failed');
      mockAxios.post.mockRejectedValue(error);

      await expect(resources.create(invalidResource)).rejects.toThrow(
        'Validation failed'
      );
    });

    it('should log creation attempts', async () => {
      const logSpy = jest.spyOn(mockLogger, 'info');
      const newResource: Resource = { name: 'Test Resource' };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...newResource },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {},
      } as AxiosResponse);

      await resources.create(newResource);

      expect(logSpy).toHaveBeenCalledWith('Creating resource', {
        resource: newResource,
      });
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const updateData = { name: 'Updated Resource' };
      const updatedResource = { id: 1, ...updateData };

      mockAxios.put.mockResolvedValueOnce({
        data: updatedResource,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse);

      const result = await resources.update(1, updateData);

      expect(result.data).toEqual(updatedResource);
      expect(mockAxios.put).toHaveBeenCalledWith('/Resources/1', updateData);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockAxios.put.mockRejectedValue(error);

      await expect(resources.update(1, { name: 'Test' })).rejects.toThrow(
        'Update failed'
      );
    });

    it('should log update attempts', async () => {
      const logSpy = jest.spyOn(mockLogger, 'info');
      const updateData = { name: 'Updated Resource' };

      mockAxios.put.mockResolvedValueOnce({
        data: { id: 1, ...updateData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse);

      await resources.update(1, updateData);

      expect(logSpy).toHaveBeenCalledWith('Updating resource', {
        id: 1,
        resource: updateData,
      });
    });
  });

  describe('delete', () => {
    it('should delete a resource', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {},
      } as AxiosResponse);

      await resources.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/Resources/1');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockAxios.delete.mockRejectedValue(error);

      await expect(resources.delete(1)).rejects.toThrow('Delete failed');
    });

    it('should log delete attempts', async () => {
      const logSpy = jest.spyOn(mockLogger, 'info');

      mockAxios.delete.mockResolvedValueOnce({
        data: undefined,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {},
      } as AxiosResponse);

      await resources.delete(1);

      expect(logSpy).toHaveBeenCalledWith('Deleting resource', { id: 1 });
    });
  });

  describe('metadata', () => {
    it('should provide correct metadata', () => {
      const metadata = Resources.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata[0].operation).toBe('createResource');
      expect(metadata[1].operation).toBe('getResource');
      expect(metadata[2].operation).toBe('updateResource');
      expect(metadata[3].operation).toBe('deleteResource');
      expect(metadata[4].operation).toBe('listResources');
    });

    it('should have correct endpoint information', () => {
      const metadata = Resources.getMetadata();
      const createMetadata = metadata.find(
        m => m.operation === 'createResource'
      );

      expect(createMetadata?.endpoint).toBe('/Resources');
      expect(createMetadata?.requiredParams).toContain('resource');
      expect(createMetadata?.returnType).toBe('Resource');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxios.get.mockRejectedValue(networkError);

      await expect(resources.list()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      mockAxios.get.mockRejectedValue(timeoutError);

      await expect(resources.list()).rejects.toThrow('Timeout');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal Server Error');
      mockAxios.get.mockRejectedValue(serverError);

      await expect(resources.list()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Temporary failure');
      const successResponse = {
        data: [{ id: 1, name: 'Resource' }],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse;

      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(successResponse);

      const result = await resources.list();

      expect(result.data).toEqual([{ id: 1, name: 'Resource' }]);
      expect(mockAxios.get).toHaveBeenCalledTimes(3);
    });

    it('should fail after maximum retries', async () => {
      const error = new Error('Persistent failure');
      mockAxios.get.mockRejectedValue(error);

      await expect(resources.list()).rejects.toThrow('Persistent failure');
      expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });
});
