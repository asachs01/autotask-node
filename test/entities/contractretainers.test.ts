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
  ContractRetainers,
  IContractRetainers,
  IContractRetainersQuery,
} from '../../src/entities/contractretainers';

describe('ContractRetainers Entity', () => {
  let contractRetainers: ContractRetainers;
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

    contractRetainers = new ContractRetainers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractretainers successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractRetainers 1' },
        { id: 2, name: 'ContractRetainers 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRetainers.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRetainers/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractRetainersQuery = {
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

      await contractRetainers.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRetainers/query', {
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
    it('should get contractretainers by id', async () => {
      const mockData = { id: 1, name: 'Test ContractRetainers' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRetainers.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRetainers/1');
    });
  });

  describe('create', () => {
    it('should create contractretainers successfully', async () => {
      const contractRetainersData = { name: 'New ContractRetainers' };
      const mockResponse = { id: 1, ...contractRetainersData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractRetainers.create(contractRetainersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractRetainers', contractRetainersData);
    });
  });

  describe('update', () => {
    it('should update contractretainers successfully', async () => {
      const contractRetainersData = { name: 'Updated ContractRetainers' };
      const mockResponse = { id: 1, ...contractRetainersData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRetainers.update(1, contractRetainersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractRetainers/1', contractRetainersData);
    });
  });

  describe('patch', () => {
    it('should partially update contractretainers successfully', async () => {
      const contractRetainersData = { name: 'Patched ContractRetainers' };
      const mockResponse = { id: 1, ...contractRetainersData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRetainers.patch(1, contractRetainersData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractRetainers/1', contractRetainersData);
    });
  });

  describe('delete', () => {
    it('should delete contractretainers successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractRetainers.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractRetainers/1');
    });
  });
});