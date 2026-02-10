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
  ArticleTagAssociations,
  IArticleTagAssociations,
  IArticleTagAssociationsQuery,
} from '../../src/entities/articletagassociations';

describe('ArticleTagAssociations Entity', () => {
  let articleTagAssociations: ArticleTagAssociations;
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

    articleTagAssociations = new ArticleTagAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articletagassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleTagAssociations 1' },
        { id: 2, name: 'ArticleTagAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await articleTagAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ArticleTagAssociations/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IArticleTagAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await articleTagAssociations.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ArticleTagAssociations/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get articletagassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleTagAssociations' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await articleTagAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleTagAssociations/1');
    });
  });

  describe('create', () => {
    it('should create articletagassociations successfully', async () => {
      const articleTagAssociationsData = { name: 'New ArticleTagAssociations' };
      const mockResponse = { id: 1, ...articleTagAssociationsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await articleTagAssociations.create(
        articleTagAssociationsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ArticleTagAssociations',
        articleTagAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete articletagassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await articleTagAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ArticleTagAssociations/1'
      );
    });
  });
});
