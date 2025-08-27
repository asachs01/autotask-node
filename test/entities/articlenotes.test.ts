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
  ArticleNotes,
  IArticleNotes,
  IArticleNotesQuery,
} from '../../src/entities/articlenotes';

describe('ArticleNotes Entity', () => {
  let articleNotes: ArticleNotes;
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

    articleNotes = new ArticleNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articlenotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticleNotes 1' },
        { id: 2, name: 'ArticleNotes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleNotes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleNotes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IArticleNotesQuery = {
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

      await articleNotes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleNotes/query', {
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
    it('should get articlenotes by id', async () => {
      const mockData = { id: 1, name: 'Test ArticleNotes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticleNotes/1');
    });
  });

  describe('create', () => {
    it('should create articlenotes successfully', async () => {
      const articleNotesData = { name: 'New ArticleNotes' };
      const mockResponse = { id: 1, ...articleNotesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await articleNotes.create(articleNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ArticleNotes', articleNotesData);
    });
  });

  describe('update', () => {
    it('should update articlenotes successfully', async () => {
      const articleNotesData = { name: 'Updated ArticleNotes' };
      const mockResponse = { id: 1, ...articleNotesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleNotes.update(1, articleNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ArticleNotes/1', articleNotesData);
    });
  });

  describe('patch', () => {
    it('should partially update articlenotes successfully', async () => {
      const articleNotesData = { name: 'Patched ArticleNotes' };
      const mockResponse = { id: 1, ...articleNotesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await articleNotes.patch(1, articleNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ArticleNotes/1', articleNotesData);
    });
  });
});