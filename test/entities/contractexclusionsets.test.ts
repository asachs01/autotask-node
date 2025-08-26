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
  ContractExclusionSets,
  IContractExclusionSets,
  IContractExclusionSetsQuery,
} from '../../src/entities/contractexclusionsets';

describe('ContractExclusionSets Entity', () => {
  let contractExclusionSets: ContractExclusionSets;
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

    contractExclusionSets = new ContractExclusionSets(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsets successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSets 1' },
        { id: 2, name: 'ContractExclusionSets 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSets.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetsQuery = {
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

      await contractExclusionSets.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/query', {
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
    it('should get contractexclusionsets by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionSets' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSets.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'New ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSets.create(contractExclusionSetsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusionSets', contractExclusionSetsData);
    });
  });

  describe('update', () => {
    it('should update contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'Updated ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSets.update(1, contractExclusionSetsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractExclusionSets/1', contractExclusionSetsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'Patched ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSets.patch(1, contractExclusionSetsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractExclusionSets/1', contractExclusionSetsData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsets successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractExclusionSets.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionSets/1');
    });
  });
});