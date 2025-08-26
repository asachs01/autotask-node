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

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleToArticleAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleToArticleAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IArticleToArticleAssociationsQuery = {
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

      await articleToArticleAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleToArticleAssociations/query', {
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
    it('should get articletoarticleassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleToArticleAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleToArticleAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleToArticleAssociations/1');
    });
  });

  describe('create', () => {
    it('should create articletoarticleassociations successfully', async () => {
      const articleToArticleAssociationsData = { name: 'New ArticleToArticleAssociations' };
      const mockResponse = { id: 1, ...articleToArticleAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await articleToArticleAssociations.create(articleToArticleAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ArticleToArticleAssociations', articleToArticleAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete articletoarticleassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await articleToArticleAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ArticleToArticleAssociations/1');
    });
  });
});