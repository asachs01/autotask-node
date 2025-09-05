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
  ArticleAttachments,
  IArticleAttachments,
  IArticleAttachmentsQuery,
} from '../../src/entities/articleattachments';

describe('ArticleAttachments Entity', () => {
  let articleAttachments: ArticleAttachments;
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

    articleAttachments = new ArticleAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articleattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleAttachments 1' },
        { id: 2, name: 'ArticleAttachments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await articleAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleAttachments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IArticleAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await articleAttachments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleAttachments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get articleattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleAttachments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await articleAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleAttachments/1');
    });
  });

  describe('create', () => {
    it('should create articleattachments successfully', async () => {
      const articleAttachmentsData = { name: 'New ArticleAttachments' };
      const mockResponse = { id: 1, ...articleAttachmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await articleAttachments.create(articleAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ArticleAttachments', articleAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete articleattachments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await articleAttachments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ArticleAttachments/1');
    });
  });
});