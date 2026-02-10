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

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await tagAliases.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/TagAliases/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ITagAliasesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await tagAliases.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/TagAliases/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get tagaliases by id', async () => {
      const mockData = { id: 1, name: 'Test TagAliases' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await tagAliases.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/TagAliases/1');
    });
  });

  describe('create', () => {
    it('should create tagaliases successfully', async () => {
      const tagAliasesData = { name: 'New TagAliases' };
      const mockResponse = { id: 1, ...tagAliasesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await tagAliases.create(tagAliasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/TagAliases',
        tagAliasesData
      );
    });
  });

  describe('update', () => {
    it('should update tagaliases successfully', async () => {
      const tagAliasesData = { name: 'Updated TagAliases' };
      const mockResponse = { id: 1, ...tagAliasesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await tagAliases.update(1, tagAliasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/TagAliases/1',
        tagAliasesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update tagaliases successfully', async () => {
      const tagAliasesData = { name: 'Patched TagAliases' };
      const mockResponse = { id: 1, ...tagAliasesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await tagAliases.patch(1, tagAliasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/TagAliases/1',
        tagAliasesData
      );
    });
  });

  describe('delete', () => {
    it('should delete tagaliases successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await tagAliases.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/TagAliases/1');
    });
  });
});
