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
  ExpenseReportAttachments,
  IExpenseReportAttachments,
  IExpenseReportAttachmentsQuery,
} from '../../src/entities/expensereportattachments';

describe('ExpenseReportAttachments Entity', () => {
  let expenseReportAttachments: ExpenseReportAttachments;
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

    expenseReportAttachments = new ExpenseReportAttachments(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list expensereportattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ExpenseReportAttachments 1' },
        { id: 2, name: 'ExpenseReportAttachments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await expenseReportAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ExpenseReportAttachments/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IExpenseReportAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await expenseReportAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ExpenseReportAttachments/query',
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
    it('should get expensereportattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ExpenseReportAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await expenseReportAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseReportAttachments/1');
    });
  });

  describe('create', () => {
    it('should create expensereportattachments successfully', async () => {
      const expenseReportAttachmentsData = {
        name: 'New ExpenseReportAttachments',
      };
      const mockResponse = { id: 1, ...expenseReportAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await expenseReportAttachments.create(
        expenseReportAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ExpenseReportAttachments',
        expenseReportAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete expensereportattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await expenseReportAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ExpenseReportAttachments/1'
      );
    });
  });
});
