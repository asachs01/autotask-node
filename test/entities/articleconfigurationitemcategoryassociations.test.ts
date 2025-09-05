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
  ArticleConfigurationItemCategoryAssociations,
  IArticleConfigurationItemCategoryAssociations,
  IArticleConfigurationItemCategoryAssociationsQuery,
} from '../../src/entities/articleconfigurationitemcategoryassociations';

describe('ArticleConfigurationItemCategoryAssociations Entity', () => {
  let articleConfigurationItemCategoryAssociations: ArticleConfigurationItemCategoryAssociations;
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

    articleConfigurationItemCategoryAssociations = new ArticleConfigurationItemCategoryAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articleconfigurationitemcategoryassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleConfigurationItemCategoryAssociations 1' },
        { id: 2, name: 'ArticleConfigurationItemCategoryAssociations 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await articleConfigurationItemCategoryAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleConfigurationItemCategoryAssociations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IArticleConfigurationItemCategoryAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await articleConfigurationItemCategoryAssociations.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleConfigurationItemCategoryAssociations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get articleconfigurationitemcategoryassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleConfigurationItemCategoryAssociations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await articleConfigurationItemCategoryAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleConfigurationItemCategoryAssociations/1');
    });
  });

  describe('create', () => {
    it('should create articleconfigurationitemcategoryassociations successfully', async () => {
      const articleConfigurationItemCategoryAssociationsData = { name: 'New ArticleConfigurationItemCategoryAssociations' };
      const mockResponse = { id: 1, ...articleConfigurationItemCategoryAssociationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await articleConfigurationItemCategoryAssociations.create(articleConfigurationItemCategoryAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ArticleConfigurationItemCategoryAssociations', articleConfigurationItemCategoryAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete articleconfigurationitemcategoryassociations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await articleConfigurationItemCategoryAssociations.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ArticleConfigurationItemCategoryAssociations/1');
    });
  });
});