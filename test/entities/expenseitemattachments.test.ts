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

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await expenseItemAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseItemAttachments/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IExpenseItemAttachmentsQuery = {
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

      await expenseItemAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseItemAttachments/query', {
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
    it('should get expenseitemattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ExpenseItemAttachments' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await expenseItemAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseItemAttachments/1');
    });
  });

  describe('create', () => {
    it('should create expenseitemattachments successfully', async () => {
      const expenseItemAttachmentsData = { name: 'New ExpenseItemAttachments' };
      const mockResponse = { id: 1, ...expenseItemAttachmentsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await expenseItemAttachments.create(expenseItemAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ExpenseItemAttachments', expenseItemAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete expenseitemattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await expenseItemAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ExpenseItemAttachments/1');
    });
  });
});