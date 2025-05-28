import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Expenses, Expense } from '../../src/entities/expenses';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('Expenses', () => {
  let expenses: Expenses;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    expenses = new Expenses(mockAxios, mockLogger);
  });

  describe('constructor', () => {
    it('should initialize with correct endpoint', () => {
      expect(expenses['endpoint']).toBe('/Expenses');
    });

    it('should store the axios instance and logger', () => {
      expect(expenses['axios']).toBe(mockAxios);
      expect(expenses['logger']).toBe(mockLogger);
    });
  });

  describe('list', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, description: 'Test Expense' }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = { pageSize: 10, page: 1 };
      const result = await expenses.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/Expenses', {
        params: { pageSize: 10, page: 1 },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle empty options', async () => {
      const mockResponse = { data: [] };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await expenses.list();

      expect(mockAxios.get).toHaveBeenCalledWith('/Expenses', { params: {} });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle filter options', async () => {
      const mockResponse = {
        data: [{ id: 1, description: 'Filtered Expense' }],
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const options = {
        filter: { accountId: 123 },
        sort: 'description asc',
        pageSize: 5,
      };
      const result = await expenses.list(options);

      expect(mockAxios.get).toHaveBeenCalledWith('/Expenses', {
        params: {
          search: JSON.stringify({ accountId: 123 }),
          sort: 'description asc',
          pageSize: 5,
        },
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors from axios', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(expenses.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should call axios.get with correct ID', async () => {
      const mockExpense = { id: 123, description: 'Test Expense' };
      const mockResponse = { data: mockExpense };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await expenses.get(123);

      expect(mockAxios.get).toHaveBeenCalledWith('/Expenses/123');
      expect(result.data).toEqual(mockExpense);
    });

    it('should propagate errors for non-existent expense', async () => {
      const error = new Error('Expense not found');
      mockAxios.get.mockRejectedValue(error);

      await expect(expenses.get(999)).rejects.toThrow('Expense not found');
    });
  });

  describe('create', () => {
    it('should call axios.post with expense data', async () => {
      const expenseData: Expense = {
        accountId: 123,
        description: 'New Expense',
        amount: 100.5,
        expenseDate: '2024-01-15',
      };
      const mockResponse = { data: { id: 789, ...expenseData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await expenses.create(expenseData);

      expect(mockAxios.post).toHaveBeenCalledWith('/Expenses', expenseData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle minimal expense data', async () => {
      const minimalData: Expense = {
        accountId: 123,
        description: 'Minimal Expense',
      };
      const mockResponse = { data: { id: 790, ...minimalData } };
      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await expenses.create(minimalData);

      expect(mockAxios.post).toHaveBeenCalledWith('/Expenses', minimalData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate validation errors', async () => {
      const invalidData = { description: 'Missing required fields' };
      const error = new Error('Validation failed');
      mockAxios.post.mockRejectedValue(error);

      await expect(expenses.create(invalidData as Expense)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('update', () => {
    it('should call axios.put with ID and update data', async () => {
      const updateData = { description: 'Updated Expense', amount: 200.75 };
      const mockResponse = { data: { id: 123, ...updateData } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await expenses.update(123, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith('/Expenses/123', updateData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle empty update data', async () => {
      const mockResponse = { data: { id: 123 } };
      mockAxios.put.mockResolvedValue(mockResponse);

      const result = await expenses.update(123, {});

      expect(mockAxios.put).toHaveBeenCalledWith('/Expenses/123', {});
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should propagate errors for non-existent expense', async () => {
      const error = new Error('Expense not found');
      mockAxios.put.mockRejectedValue(error);

      await expect(
        expenses.update(999, { description: 'Update' })
      ).rejects.toThrow('Expense not found');
    });
  });

  describe('delete', () => {
    it('should call axios.delete with correct ID', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await expenses.delete(123);

      expect(mockAxios.delete).toHaveBeenCalledWith('/Expenses/123');
    });

    it('should propagate errors for non-existent expense', async () => {
      const error = new Error('Expense not found');
      mockAxios.delete.mockRejectedValue(error);

      await expect(expenses.delete(999)).rejects.toThrow('Expense not found');
    });

    it('should not return a value on successful deletion', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      const result = await expenses.delete(123);

      expect(result).toBeUndefined();
    });
  });

  describe('error handling with retry', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network timeout');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      const result = await expenses.get(123);

      expect(mockAxios.get).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ id: 123 });
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      mockAxios.get.mockRejectedValue(error);

      await expect(expenses.get(123)).rejects.toThrow('Persistent error');
      expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('logging', () => {
    it('should log operations', async () => {
      mockAxios.get.mockResolvedValue({ data: { id: 123 } });

      await expenses.get(123);

      expect(mockLogger.info).toHaveBeenCalledWith('Getting expense', {
        id: 123,
      });
    });

    it('should log warnings on retry', async () => {
      const error = new Error('Temporary error');
      mockAxios.get
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { id: 123 } });

      await expenses.get(123);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Request failed (attempt 1)')
      );
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = Expenses.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createExpense',
        'getExpense',
        'updateExpense',
        'deleteExpense',
        'listExpenses',
      ]);
    });
  });

  describe('type safety', () => {
    it('should accept valid expense data types', () => {
      const validExpense: Expense = {
        accountId: 123,
        description: 'Valid Expense',
        amount: 50.25,
        expenseDate: '2024-01-15',
        projectId: 456,
        resourceId: 789,
      };

      // This should compile without errors - just verify the type is valid
      expect(validExpense).toBeDefined();
      expect(typeof validExpense.accountId).toBe('number');
      expect(typeof validExpense.description).toBe('string');
    });
  });
});
