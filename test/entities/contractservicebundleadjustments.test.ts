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
  ContractServiceBundleAdjustments,
  IContractServiceBundleAdjustments,
  IContractServiceBundleAdjustmentsQuery,
} from '../../src/entities/contractservicebundleadjustments';

describe('ContractServiceBundleAdjustments Entity', () => {
  let contractServiceBundleAdjustments: ContractServiceBundleAdjustments;
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

    contractServiceBundleAdjustments = new ContractServiceBundleAdjustments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservicebundleadjustments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceBundleAdjustments 1' },
        { id: 2, name: 'ContractServiceBundleAdjustments 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleAdjustments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceBundleAdjustmentsQuery = {
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

      await contractServiceBundleAdjustments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/query', {
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
    it('should get contractservicebundleadjustments by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceBundleAdjustments' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleAdjustments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1');
    });
  });

  describe('create', () => {
    it('should create contractservicebundleadjustments successfully', async () => {
      const contractServiceBundleAdjustmentsData = { name: 'New ContractServiceBundleAdjustments' };
      const mockResponse = { id: 1, ...contractServiceBundleAdjustmentsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleAdjustments.create(contractServiceBundleAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServiceBundleAdjustments', contractServiceBundleAdjustmentsData);
    });
  });

  describe('update', () => {
    it('should update contractservicebundleadjustments successfully', async () => {
      const contractServiceBundleAdjustmentsData = { name: 'Updated ContractServiceBundleAdjustments' };
      const mockResponse = { id: 1, ...contractServiceBundleAdjustmentsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleAdjustments.update(1, contractServiceBundleAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1', contractServiceBundleAdjustmentsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractservicebundleadjustments successfully', async () => {
      const contractServiceBundleAdjustmentsData = { name: 'Patched ContractServiceBundleAdjustments' };
      const mockResponse = { id: 1, ...contractServiceBundleAdjustmentsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleAdjustments.patch(1, contractServiceBundleAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1', contractServiceBundleAdjustmentsData);
    });
  });

  describe('delete', () => {
    it('should delete contractservicebundleadjustments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractServiceBundleAdjustments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1');
    });
  });
});