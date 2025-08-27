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
  TagGroups,
  ITagGroups,
  ITagGroupsQuery,
} from '../../src/entities/taggroups';

describe('TagGroups Entity', () => {
  let tagGroups: TagGroups;
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

    tagGroups = new TagGroups(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list taggroups successfully', async () => {
      const mockData = [
        { id: 1, name: 'TagGroups 1' },
        { id: 2, name: 'TagGroups 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagGroups.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TagGroups/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ITagGroupsQuery = {
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

      await tagGroups.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/TagGroups/query', {
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
    it('should get taggroups by id', async () => {
      const mockData = { id: 1, name: 'Test TagGroups' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagGroups.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TagGroups/1');
    });
  });

  describe('create', () => {
    it('should create taggroups successfully', async () => {
      const tagGroupsData = { name: 'New TagGroups' };
      const mockResponse = { id: 1, ...tagGroupsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await tagGroups.create(tagGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TagGroups', tagGroupsData);
    });
  });

  describe('update', () => {
    it('should update taggroups successfully', async () => {
      const tagGroupsData = { name: 'Updated TagGroups' };
      const mockResponse = { id: 1, ...tagGroupsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagGroups.update(1, tagGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TagGroups/1', tagGroupsData);
    });
  });

  describe('patch', () => {
    it('should partially update taggroups successfully', async () => {
      const tagGroupsData = { name: 'Patched TagGroups' };
      const mockResponse = { id: 1, ...tagGroupsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await tagGroups.patch(1, tagGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/TagGroups/1', tagGroupsData);
    });
  });

  describe('delete', () => {
    it('should delete taggroups successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await tagGroups.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TagGroups/1');
    });
  });
});