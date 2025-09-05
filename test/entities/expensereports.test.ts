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
  ExpenseReports,
  IExpenseReports,
  IExpenseReportsQuery,
} from '../../src/entities/expensereports';

describe('ExpenseReports Entity', () => {
  let expenseReports: ExpenseReports;
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

    expenseReports = new ExpenseReports(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list expensereports successfully', async () => {
      const mockData = [
        { id: 1, name: 'ExpenseReports 1' },
        { id: 2, name: 'ExpenseReports 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await expenseReports.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ExpenseReports/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IExpenseReportsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await expenseReports.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ExpenseReports/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get expensereports by id', async () => {
      const mockData = { id: 1, name: 'Test ExpenseReports' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await expenseReports.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ExpenseReports/1');
    });
  });

  describe('create', () => {
    it('should create expensereports successfully', async () => {
      const expenseReportsData = { name: 'New ExpenseReports' };
      const mockResponse = { id: 1, ...expenseReportsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await expenseReports.create(expenseReportsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ExpenseReports', expenseReportsData);
    });
  });

  describe('update', () => {
    it('should update expensereports successfully', async () => {
      const expenseReportsData = { name: 'Updated ExpenseReports' };
      const mockResponse = { id: 1, ...expenseReportsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await expenseReports.update(1, expenseReportsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ExpenseReports/1', expenseReportsData);
    });
  });

  describe('patch', () => {
    it('should partially update expensereports successfully', async () => {
      const expenseReportsData = { name: 'Patched ExpenseReports' };
      const mockResponse = { id: 1, ...expenseReportsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await expenseReports.patch(1, expenseReportsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ExpenseReports/1', expenseReportsData);
    });
  });

  describe('delete', () => {
    it('should delete expensereports successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await expenseReports.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ExpenseReports/1');
    });
  });
});