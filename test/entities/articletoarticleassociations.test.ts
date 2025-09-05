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
  ArticleToArticleAssociations,
  IArticleToArticleAssociations,
  IArticleToArticleAssociationsQuery,
} from '../../src/entities/articletoarticleassociations';

describe('ArticleToArticleAssociations Entity', () => {
  let articleToArticleAssociations: ArticleToArticleAssociations;
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

    articleToArticleAssociations = new ArticleToArticleAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articletoarticleassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleToArticleAssociations 1' },
        { id: 2, name: 'ArticleToArticleAssociations 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await articleToArticleAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleToArticleAssociations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IArticleToArticleAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await articleToArticleAssociations.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleToArticleAssociations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get articletoarticleassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleToArticleAssociations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await articleToArticleAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleToArticleAssociations/1');
    });
  });

  describe('create', () => {
    it('should create articletoarticleassociations successfully', async () => {
      const articleToArticleAssociationsData = { name: 'New ArticleToArticleAssociations' };
      const mockResponse = { id: 1, ...articleToArticleAssociationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await articleToArticleAssociations.create(articleToArticleAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ArticleToArticleAssociations', articleToArticleAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete articletoarticleassociations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await articleToArticleAssociations.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ArticleToArticleAssociations/1');
    });
  });
});