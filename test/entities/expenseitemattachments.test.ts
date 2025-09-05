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
  ExpenseItemAttachments,
  IExpenseItemAttachments,
  IExpenseItemAttachmentsQuery,
} from '../../src/entities/expenseitemattachments';

describe('ExpenseItemAttachments Entity', () => {
  let expenseItemAttachments: ExpenseItemAttachments;
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

    expenseItemAttachments = new ExpenseItemAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list expenseitemattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ExpenseItemAttachments 1' },
        { id: 2, name: 'ExpenseItemAttachments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await expenseItemAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ExpenseItemAttachments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IExpenseItemAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await expenseItemAttachments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ExpenseItemAttachments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get expenseitemattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ExpenseItemAttachments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await expenseItemAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ExpenseItemAttachments/1');
    });
  });

  describe('create', () => {
    it('should create expenseitemattachments successfully', async () => {
      const expenseItemAttachmentsData = { name: 'New ExpenseItemAttachments' };
      const mockResponse = { id: 1, ...expenseItemAttachmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await expenseItemAttachments.create(expenseItemAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ExpenseItemAttachments', expenseItemAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete expenseitemattachments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await expenseItemAttachments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ExpenseItemAttachments/1');
    });
  });
});