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
  ContractServiceBundles,
  IContractServiceBundles,
  IContractServiceBundlesQuery,
} from '../../src/entities/contractservicebundles';

describe('ContractServiceBundles Entity', () => {
  let contractServiceBundles: ContractServiceBundles;
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

    contractServiceBundles = new ContractServiceBundles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservicebundles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceBundles 1' },
        { id: 2, name: 'ContractServiceBundles 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundles/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceBundlesQuery = {
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

      await contractServiceBundles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundles/query', {
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
    it('should get contractservicebundles by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceBundles' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundles/1');
    });
  });

  describe('create', () => {
    it('should create contractservicebundles successfully', async () => {
      const contractServiceBundlesData = { name: 'New ContractServiceBundles' };
      const mockResponse = { id: 1, ...contractServiceBundlesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundles.create(contractServiceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServiceBundles', contractServiceBundlesData);
    });
  });

  describe('update', () => {
    it('should update contractservicebundles successfully', async () => {
      const contractServiceBundlesData = { name: 'Updated ContractServiceBundles' };
      const mockResponse = { id: 1, ...contractServiceBundlesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundles.update(1, contractServiceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractServiceBundles/1', contractServiceBundlesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractservicebundles successfully', async () => {
      const contractServiceBundlesData = { name: 'Patched ContractServiceBundles' };
      const mockResponse = { id: 1, ...contractServiceBundlesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundles.patch(1, contractServiceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractServiceBundles/1', contractServiceBundlesData);
    });
  });

  describe('delete', () => {
    it('should delete contractservicebundles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractServiceBundles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractServiceBundles/1');
    });
  });
});