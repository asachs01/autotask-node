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
  ArticleToDocumentAssociations,
  IArticleToDocumentAssociations,
  IArticleToDocumentAssociationsQuery,
} from '../../src/entities/articletodocumentassociations';

describe('ArticleToDocumentAssociations Entity', () => {
  let articleToDocumentAssociations: ArticleToDocumentAssociations;
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

    articleToDocumentAssociations = new ArticleToDocumentAssociations(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articletodocumentassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleToDocumentAssociations 1' },
        { id: 2, name: 'ArticleToDocumentAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await articleToDocumentAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ArticleToDocumentAssociations/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IArticleToDocumentAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await articleToDocumentAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ArticleToDocumentAssociations/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get articletodocumentassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleToDocumentAssociations' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await articleToDocumentAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ArticleToDocumentAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create articletodocumentassociations successfully', async () => {
      const articleToDocumentAssociationsData = {
        name: 'New ArticleToDocumentAssociations',
      };
      const mockResponse = { id: 1, ...articleToDocumentAssociationsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await articleToDocumentAssociations.create(
        articleToDocumentAssociationsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ArticleToDocumentAssociations',
        articleToDocumentAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete articletodocumentassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await articleToDocumentAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ArticleToDocumentAssociations/1'
      );
    });
  });
});
