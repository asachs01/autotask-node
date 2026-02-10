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
  SalesOrderAttachments,
  ISalesOrderAttachments,
  ISalesOrderAttachmentsQuery,
} from '../../src/entities/salesorderattachments';

describe('SalesOrderAttachments Entity', () => {
  let salesOrderAttachments: SalesOrderAttachments;
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

    salesOrderAttachments = new SalesOrderAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list salesorderattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'SalesOrderAttachments 1' },
        { id: 2, name: 'SalesOrderAttachments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await salesOrderAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/SalesOrderAttachments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: ISalesOrderAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await salesOrderAttachments.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/SalesOrderAttachments/query',
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
    it('should get salesorderattachments by id', async () => {
      const mockData = { id: 1, name: 'Test SalesOrderAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await salesOrderAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/SalesOrderAttachments/1');
    });
  });

  describe('create', () => {
    it('should create salesorderattachments successfully', async () => {
      const salesOrderAttachmentsData = { name: 'New SalesOrderAttachments' };
      const mockResponse = { id: 1, ...salesOrderAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await salesOrderAttachments.create(
        salesOrderAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/SalesOrderAttachments',
        salesOrderAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete salesorderattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await salesOrderAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/SalesOrderAttachments/1');
    });
  });
});
