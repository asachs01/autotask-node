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
  ContractServiceAdjustments,
  IContractServiceAdjustments,
  IContractServiceAdjustmentsQuery,
} from '../../src/entities/contractserviceadjustments';

describe('ContractServiceAdjustments Entity', () => {
  let contractServiceAdjustments: ContractServiceAdjustments;
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

    contractServiceAdjustments = new ContractServiceAdjustments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractserviceadjustments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceAdjustments 1' },
        { id: 2, name: 'ContractServiceAdjustments 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceAdjustments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceAdjustments/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceAdjustmentsQuery = {
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

      await contractServiceAdjustments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceAdjustments/query', {
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
    it('should get contractserviceadjustments by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceAdjustments' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceAdjustments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceAdjustments/1');
    });
  });

  describe('create', () => {
    it('should create contractserviceadjustments successfully', async () => {
      const contractServiceAdjustmentsData = { name: 'New ContractServiceAdjustments' };
      const mockResponse = { id: 1, ...contractServiceAdjustmentsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceAdjustments.create(contractServiceAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServiceAdjustments', contractServiceAdjustmentsData);
    });
  });

  describe('update', () => {
    it('should update contractserviceadjustments successfully', async () => {
      const contractServiceAdjustmentsData = { name: 'Updated ContractServiceAdjustments' };
      const mockResponse = { id: 1, ...contractServiceAdjustmentsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceAdjustments.update(1, contractServiceAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractServiceAdjustments/1', contractServiceAdjustmentsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractserviceadjustments successfully', async () => {
      const contractServiceAdjustmentsData = { name: 'Patched ContractServiceAdjustments' };
      const mockResponse = { id: 1, ...contractServiceAdjustmentsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceAdjustments.patch(1, contractServiceAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractServiceAdjustments/1', contractServiceAdjustmentsData);
    });
  });

  describe('delete', () => {
    it('should delete contractserviceadjustments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractServiceAdjustments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractServiceAdjustments/1');
    });
  });
});