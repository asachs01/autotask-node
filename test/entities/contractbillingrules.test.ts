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
  ContractBillingRules,
  IContractBillingRules,
  IContractBillingRulesQuery,
} from '../../src/entities/contractbillingrules';

describe('ContractBillingRules Entity', () => {
  let contractBillingRules: ContractBillingRules;
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

    contractBillingRules = new ContractBillingRules(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractbillingrules successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractBillingRules 1' },
        { id: 2, name: 'ContractBillingRules 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBillingRules.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBillingRules/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractBillingRulesQuery = {
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

      await contractBillingRules.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBillingRules/query', {
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
    it('should get contractbillingrules by id', async () => {
      const mockData = { id: 1, name: 'Test ContractBillingRules' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBillingRules.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBillingRules/1');
    });
  });

  describe('create', () => {
    it('should create contractbillingrules successfully', async () => {
      const contractBillingRulesData = { name: 'New ContractBillingRules' };
      const mockResponse = { id: 1, ...contractBillingRulesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractBillingRules.create(contractBillingRulesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractBillingRules', contractBillingRulesData);
    });
  });

  describe('update', () => {
    it('should update contractbillingrules successfully', async () => {
      const contractBillingRulesData = { name: 'Updated ContractBillingRules' };
      const mockResponse = { id: 1, ...contractBillingRulesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBillingRules.update(1, contractBillingRulesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractBillingRules/1', contractBillingRulesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractbillingrules successfully', async () => {
      const contractBillingRulesData = { name: 'Patched ContractBillingRules' };
      const mockResponse = { id: 1, ...contractBillingRulesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBillingRules.patch(1, contractBillingRulesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractBillingRules/1', contractBillingRulesData);
    });
  });

  describe('delete', () => {
    it('should delete contractbillingrules successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractBillingRules.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractBillingRules/1');
    });
  });
});