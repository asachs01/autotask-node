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
  ContractAdjustments,
  ContractAdjustment,
  ContractAdjustmentQuery,
} from '../../src/entities/contractadjustments';

describe('ContractAdjustments Entity', () => {
  let contractAdjustments: ContractAdjustments;
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

    contractAdjustments = new ContractAdjustments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractadjustments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractAdjustment 1' },
        { id: 2, name: 'ContractAdjustment 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractAdjustments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractAdjustments/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ContractAdjustmentQuery = {
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

      await contractAdjustments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractAdjustments/query', {
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
    it('should get contractadjustment by id', async () => {
      const mockData = { id: 1, name: 'Test ContractAdjustment' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractAdjustments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractAdjustments/1');
    });
  });

  describe('create', () => {
    it('should create contractadjustment successfully', async () => {
      const contractAdjustmentData = { name: 'New ContractAdjustment' };
      const mockResponse = { id: 1, ...contractAdjustmentData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractAdjustments.create(contractAdjustmentData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractAdjustments', contractAdjustmentData);
    });
  });

  describe('update', () => {
    it('should update contractadjustment successfully', async () => {
      const contractAdjustmentData = { name: 'Updated ContractAdjustment' };
      const mockResponse = { id: 1, ...contractAdjustmentData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractAdjustments.update(1, contractAdjustmentData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractAdjustments/1', contractAdjustmentData);
    });
  });

  describe('patch', () => {
    it('should partially update contractadjustment successfully', async () => {
      const contractAdjustmentData = { name: 'Patched ContractAdjustment' };
      const mockResponse = { id: 1, ...contractAdjustmentData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractAdjustments.patch(1, contractAdjustmentData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractAdjustments/1', contractAdjustmentData);
    });
  });
});