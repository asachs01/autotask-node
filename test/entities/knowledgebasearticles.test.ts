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
  KnowledgeBaseArticles,
  IKnowledgeBaseArticles,
  IKnowledgeBaseArticlesQuery,
} from '../../src/entities/knowledgebasearticles';

describe('KnowledgeBaseArticles Entity', () => {
  let knowledgeBaseArticles: KnowledgeBaseArticles;
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

    knowledgeBaseArticles = new KnowledgeBaseArticles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list knowledgebasearticles successfully', async () => {
      const mockData = [
        { id: 1, name: 'KnowledgeBaseArticles 1' },
        { id: 2, name: 'KnowledgeBaseArticles 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await knowledgeBaseArticles.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/KnowledgeBaseArticles/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IKnowledgeBaseArticlesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await knowledgeBaseArticles.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/KnowledgeBaseArticles/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get knowledgebasearticles by id', async () => {
      const mockData = { id: 1, name: 'Test KnowledgeBaseArticles' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await knowledgeBaseArticles.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/KnowledgeBaseArticles/1');
    });
  });

  describe('create', () => {
    it('should create knowledgebasearticles successfully', async () => {
      const knowledgeBaseArticlesData = { name: 'New KnowledgeBaseArticles' };
      const mockResponse = { id: 1, ...knowledgeBaseArticlesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await knowledgeBaseArticles.create(knowledgeBaseArticlesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/KnowledgeBaseArticles', knowledgeBaseArticlesData);
    });
  });

  describe('update', () => {
    it('should update knowledgebasearticles successfully', async () => {
      const knowledgeBaseArticlesData = { name: 'Updated KnowledgeBaseArticles' };
      const mockResponse = { id: 1, ...knowledgeBaseArticlesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await knowledgeBaseArticles.update(1, knowledgeBaseArticlesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/KnowledgeBaseArticles/1', knowledgeBaseArticlesData);
    });
  });

  describe('patch', () => {
    it('should partially update knowledgebasearticles successfully', async () => {
      const knowledgeBaseArticlesData = { name: 'Patched KnowledgeBaseArticles' };
      const mockResponse = { id: 1, ...knowledgeBaseArticlesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await knowledgeBaseArticles.patch(1, knowledgeBaseArticlesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/KnowledgeBaseArticles/1', knowledgeBaseArticlesData);
    });
  });

  describe('delete', () => {
    it('should delete knowledgebasearticles successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await knowledgeBaseArticles.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/KnowledgeBaseArticles/1');
    });
  });
});