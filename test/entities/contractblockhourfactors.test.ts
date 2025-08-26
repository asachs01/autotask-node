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
  ContractBlockHourFactors,
  IContractBlockHourFactors,
  IContractBlockHourFactorsQuery,
} from '../../src/entities/contractblockhourfactors';

describe('ContractBlockHourFactors Entity', () => {
  let contractBlockHourFactors: ContractBlockHourFactors;
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

    contractBlockHourFactors = new ContractBlockHourFactors(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractblockhourfactors successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractBlockHourFactors 1' },
        { id: 2, name: 'ContractBlockHourFactors 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlockHourFactors.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlockHourFactors/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractBlockHourFactorsQuery = {
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

      await contractBlockHourFactors.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlockHourFactors/query', {
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
    it('should get contractblockhourfactors by id', async () => {
      const mockData = { id: 1, name: 'Test ContractBlockHourFactors' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlockHourFactors.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlockHourFactors/1');
    });
  });

  describe('create', () => {
    it('should create contractblockhourfactors successfully', async () => {
      const contractBlockHourFactorsData = { name: 'New ContractBlockHourFactors' };
      const mockResponse = { id: 1, ...contractBlockHourFactorsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlockHourFactors.create(contractBlockHourFactorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractBlockHourFactors', contractBlockHourFactorsData);
    });
  });

  describe('update', () => {
    it('should update contractblockhourfactors successfully', async () => {
      const contractBlockHourFactorsData = { name: 'Updated ContractBlockHourFactors' };
      const mockResponse = { id: 1, ...contractBlockHourFactorsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlockHourFactors.update(1, contractBlockHourFactorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractBlockHourFactors/1', contractBlockHourFactorsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractblockhourfactors successfully', async () => {
      const contractBlockHourFactorsData = { name: 'Patched ContractBlockHourFactors' };
      const mockResponse = { id: 1, ...contractBlockHourFactorsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlockHourFactors.patch(1, contractBlockHourFactorsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractBlockHourFactors/1', contractBlockHourFactorsData);
    });
  });

  describe('delete', () => {
    it('should delete contractblockhourfactors successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractBlockHourFactors.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractBlockHourFactors/1');
    });
  });
});