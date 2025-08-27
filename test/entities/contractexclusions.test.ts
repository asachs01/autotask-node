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
  ContractExclusions,
  ContractExclusion,
  ContractExclusionQuery,
} from '../../src/entities/contractexclusions';

describe('ContractExclusions Entity', () => {
  let contractExclusions: ContractExclusions;
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

    contractExclusions = new ContractExclusions(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusions successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusion 1' },
        { id: 2, name: 'ContractExclusion 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusions.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusions/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ContractExclusionQuery = {
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

      await contractExclusions.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusions/query', {
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
    it('should get contractexclusion by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusion' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusions.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusions/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusion successfully', async () => {
      const contractExclusionData = { name: 'New ContractExclusion' };
      const mockResponse = { id: 1, ...contractExclusionData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusions.create(contractExclusionData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusions', contractExclusionData);
    });
  });

  describe('update', () => {
    it('should update contractexclusion successfully', async () => {
      const contractExclusionData = { name: 'Updated ContractExclusion' };
      const mockResponse = { id: 1, ...contractExclusionData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusions.update(1, contractExclusionData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractExclusions/1', contractExclusionData);
    });
  });

  describe('patch', () => {
    it('should partially update contractexclusion successfully', async () => {
      const contractExclusionData = { name: 'Patched ContractExclusion' };
      const mockResponse = { id: 1, ...contractExclusionData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusions.patch(1, contractExclusionData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractExclusions/1', contractExclusionData);
    });
  });
});