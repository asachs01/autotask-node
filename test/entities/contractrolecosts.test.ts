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
  ContractRoleCosts,
  IContractRoleCosts,
  IContractRoleCostsQuery,
} from '../../src/entities/contractrolecosts';

describe('ContractRoleCosts Entity', () => {
  let contractRoleCosts: ContractRoleCosts;
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

    contractRoleCosts = new ContractRoleCosts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractrolecosts successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractRoleCosts 1' },
        { id: 2, name: 'ContractRoleCosts 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRoleCosts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRoleCosts/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractRoleCostsQuery = {
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

      await contractRoleCosts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRoleCosts/query', {
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
    it('should get contractrolecosts by id', async () => {
      const mockData = { id: 1, name: 'Test ContractRoleCosts' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRoleCosts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRoleCosts/1');
    });
  });

  describe('create', () => {
    it('should create contractrolecosts successfully', async () => {
      const contractRoleCostsData = { name: 'New ContractRoleCosts' };
      const mockResponse = { id: 1, ...contractRoleCostsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractRoleCosts.create(contractRoleCostsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractRoleCosts', contractRoleCostsData);
    });
  });

  describe('update', () => {
    it('should update contractrolecosts successfully', async () => {
      const contractRoleCostsData = { name: 'Updated ContractRoleCosts' };
      const mockResponse = { id: 1, ...contractRoleCostsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRoleCosts.update(1, contractRoleCostsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractRoleCosts/1', contractRoleCostsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractrolecosts successfully', async () => {
      const contractRoleCostsData = { name: 'Patched ContractRoleCosts' };
      const mockResponse = { id: 1, ...contractRoleCostsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractRoleCosts.patch(1, contractRoleCostsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractRoleCosts/1', contractRoleCostsData);
    });
  });

  describe('delete', () => {
    it('should delete contractrolecosts successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractRoleCosts.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractRoleCosts/1');
    });
  });
});