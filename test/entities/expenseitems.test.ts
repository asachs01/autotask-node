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
  ExpenseItems,
  IExpenseItems,
  IExpenseItemsQuery,
} from '../../src/entities/expenseitems';

describe('ExpenseItems Entity', () => {
  let expenseItems: ExpenseItems;
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

    expenseItems = new ExpenseItems(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list expenseitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'ExpenseItems 1' },
        { id: 2, name: 'ExpenseItems 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await expenseItems.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseItems/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IExpenseItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await expenseItems.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseItems/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get expenseitems by id', async () => {
      const mockData = { id: 1, name: 'Test ExpenseItems' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await expenseItems.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ExpenseItems/1');
    });
  });

  describe('create', () => {
    it('should create expenseitems successfully', async () => {
      const expenseItemsData = { name: 'New ExpenseItems' };
      const mockResponse = { id: 1, ...expenseItemsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await expenseItems.create(expenseItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ExpenseItems',
        expenseItemsData
      );
    });
  });

  describe('update', () => {
    it('should update expenseitems successfully', async () => {
      const expenseItemsData = { name: 'Updated ExpenseItems' };
      const mockResponse = { id: 1, ...expenseItemsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await expenseItems.update(1, expenseItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ExpenseItems/1',
        expenseItemsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update expenseitems successfully', async () => {
      const expenseItemsData = { name: 'Patched ExpenseItems' };
      const mockResponse = { id: 1, ...expenseItemsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await expenseItems.patch(1, expenseItemsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ExpenseItems/1',
        expenseItemsData
      );
    });
  });

  describe('delete', () => {
    it('should delete expenseitems successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await expenseItems.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ExpenseItems/1');
    });
  });
});
