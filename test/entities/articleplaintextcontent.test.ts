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
  ArticlePlainTextContent,
  IArticlePlainTextContent,
  IArticlePlainTextContentQuery,
} from '../../src/entities/articleplaintextcontent';

describe('ArticlePlainTextContent Entity', () => {
  let articlePlainTextContent: ArticlePlainTextContent;
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

    articlePlainTextContent = new ArticlePlainTextContent(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list articleplaintextcontent successfully', async () => {
      const mockData = [
        { id: 1, name: 'ArticlePlainTextContent 1' },
        { id: 2, name: 'ArticlePlainTextContent 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await articlePlainTextContent.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ArticlePlainTextContent/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IArticlePlainTextContentQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await articlePlainTextContent.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ArticlePlainTextContent/query',
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
    it('should get articleplaintextcontent by id', async () => {
      const mockData = { id: 1, name: 'Test ArticlePlainTextContent' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await articlePlainTextContent.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ArticlePlainTextContent/1');
    });
  });
});
