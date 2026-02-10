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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await tagGroups.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/TagGroups/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ITagGroupsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await tagGroups.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/TagGroups/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get taggroups by id', async () => {
      const mockData = { id: 1, name: 'Test TagGroups' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await tagGroups.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TagGroups/1');
    });
  });

  describe('create', () => {
    it('should create taggroups successfully', async () => {
      const tagGroupsData = { name: 'New TagGroups' };
      const mockResponse = { id: 1, ...tagGroupsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await tagGroups.create(tagGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/TagGroups', tagGroupsData);
    });
  });

  describe('update', () => {
    it('should update taggroups successfully', async () => {
      const tagGroupsData = { name: 'Updated TagGroups' };
      const mockResponse = { id: 1, ...tagGroupsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await tagGroups.update(1, tagGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/TagGroups/1', tagGroupsData);
    });
  });

  describe('patch', () => {
    it('should partially update taggroups successfully', async () => {
      const tagGroupsData = { name: 'Patched TagGroups' };
      const mockResponse = { id: 1, ...tagGroupsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await tagGroups.patch(1, tagGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/TagGroups/1',
        tagGroupsData
      );
    });
  });

  describe('delete', () => {
    it('should delete taggroups successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await tagGroups.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TagGroups/1');
    });
  });
});
