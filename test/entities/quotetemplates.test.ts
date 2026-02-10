import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import winston from 'winston';
import {
  QuoteTemplates,
  IQuoteTemplates,
  IQuoteTemplatesQuery,
} from '../../src/entities/quotetemplates';

describe('QuoteTemplates Entity', () => {
  let quoteTemplates: QuoteTemplates;
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

    quoteTemplates = new QuoteTemplates(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list quotetemplates successfully', async () => {
      const mockData = [
        { id: 1, name: 'QuoteTemplates 1' },
        { id: 2, name: 'QuoteTemplates 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await quoteTemplates.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/QuoteTemplates/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IQuoteTemplatesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await quoteTemplates.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/QuoteTemplates/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get quotetemplates by id', async () => {
      const mockData = { id: 1, name: 'Test QuoteTemplates' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await quoteTemplates.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/QuoteTemplates/1');
    });
  });
});
