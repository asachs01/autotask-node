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

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleTicketAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleTicketAssociations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IArticleTicketAssociationsQuery = {
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

      await articleTicketAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleTicketAssociations/query', {
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
    it('should get articleticketassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleTicketAssociations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleTicketAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleTicketAssociations/1');
    });
  });

  describe('create', () => {
    it('should create articleticketassociations successfully', async () => {
      const articleTicketAssociationsData = { name: 'New ArticleTicketAssociations' };
      const mockResponse = { id: 1, ...articleTicketAssociationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await articleTicketAssociations.create(articleTicketAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ArticleTicketAssociations', articleTicketAssociationsData);
    });
  });

  describe('delete', () => {
    it('should delete articleticketassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await articleTicketAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ArticleTicketAssociations/1');
    });
  });
});