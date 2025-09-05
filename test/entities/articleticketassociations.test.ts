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
  ArticleTicketAssociations,
  IArticleTicketAssociations,
  IArticleTicketAssociationsQuery,
} from '../../src/entities/articleticketassociations';

describe('ArticleTicketAssociations Entity', () => {
  let articleTicketAssociations: ArticleTicketAssociations;
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

    articleTicketAssociations = new ArticleTicketAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articleticketassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleTicketAssociations 1' },
        { id: 2, name: 'ArticleTicketAssociations 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await articleTicketAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleTicketAssociations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IArticleTicketAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await articleTicketAssociations.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleTicketAssociations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get articleticketassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleTicketAssociations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await articleTicketAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ArticleTicketAssociations/1');
    });
  });

  describe('create', () => {
    it('should create articleticketassociations successfully', async () => {
      const articleTicketAssociationsData = { name: 'New ArticleTicketAssociations' };
      const mockResponse = { id: 1, ...articleTicketAssociationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await articleTicketAssociations.create(articleTicketAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ArticleTicketAssociations', articleTicketAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete articleticketassociations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await articleTicketAssociations.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ArticleTicketAssociations/1');
    });
  });
});