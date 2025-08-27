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
  ContractExclusionBillingCodes,
  IContractExclusionBillingCodes,
  IContractExclusionBillingCodesQuery,
} from '../../src/entities/contractexclusionbillingcodes';

describe('ContractExclusionBillingCodes Entity', () => {
  let contractExclusionBillingCodes: ContractExclusionBillingCodes;
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

    contractExclusionBillingCodes = new ContractExclusionBillingCodes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionbillingcodes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionBillingCodes 1' },
        { id: 2, name: 'ContractExclusionBillingCodes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionBillingCodes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionBillingCodes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionBillingCodesQuery = {
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

      await contractExclusionBillingCodes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionBillingCodes/query', {
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
    it('should get contractexclusionbillingcodes by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionBillingCodes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionBillingCodes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionBillingCodes/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionbillingcodes successfully', async () => {
      const contractExclusionBillingCodesData = { name: 'New ContractExclusionBillingCodes' };
      const mockResponse = { id: 1, ...contractExclusionBillingCodesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionBillingCodes.create(contractExclusionBillingCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusionBillingCodes', contractExclusionBillingCodesData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionbillingcodes successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractExclusionBillingCodes.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionBillingCodes/1');
    });
  });
});