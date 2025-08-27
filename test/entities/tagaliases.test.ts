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
  TagAliases,
  ITagAliases,
  ITagAliasesQuery,
} from '../../src/entities/tagaliases';

describe('TagAliases Entity', () => {
  let tagAliases: TagAliases;
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

    tagAliases = new TagAliases(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list tagaliases successfully', async () => {
      const mockData = [
        { id: 1, name: 'TagAliases 1' },
        { id: 2, name: 'TagAliases 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagAliases.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TagAliases/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITagAliasesQuery = {
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

      await tagAliases.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TagAliases/query', {
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
    it('should get tagaliases by id', async () => {
      const mockData = { id: 1, name: 'Test TagAliases' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagAliases.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TagAliases/1');
    });
  });

  describe('create', () => {
    it('should create tagaliases successfully', async () => {
      const tagAliasesData = { name: 'New TagAliases' };
      const mockResponse = { id: 1, ...tagAliasesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await tagAliases.create(tagAliasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TagAliases', tagAliasesData);
    });
  });

  describe('update', () => {
    it('should update tagaliases successfully', async () => {
      const tagAliasesData = { name: 'Updated TagAliases' };
      const mockResponse = { id: 1, ...tagAliasesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagAliases.update(1, tagAliasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TagAliases/1', tagAliasesData);
    });
  });

  describe('patch', () => {
    it('should partially update tagaliases successfully', async () => {
      const tagAliasesData = { name: 'Patched TagAliases' };
      const mockResponse = { id: 1, ...tagAliasesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagAliases.patch(1, tagAliasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TagAliases/1', tagAliasesData);
    });
  });

  describe('delete', () => {
    it('should delete tagaliases successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await tagAliases.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TagAliases/1');
    });
  });
});