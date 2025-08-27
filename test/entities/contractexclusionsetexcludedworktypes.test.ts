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
  ContractExclusionSetExcludedWorkTypes,
  IContractExclusionSetExcludedWorkTypes,
  IContractExclusionSetExcludedWorkTypesQuery,
} from '../../src/entities/contractexclusionsetexcludedworktypes';

describe('ContractExclusionSetExcludedWorkTypes Entity', () => {
  let contractExclusionSetExcludedWorkTypes: ContractExclusionSetExcludedWorkTypes;
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

    contractExclusionSetExcludedWorkTypes = new ContractExclusionSetExcludedWorkTypes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsetexcludedworktypes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSetExcludedWorkTypes 1' },
        { id: 2, name: 'ContractExclusionSetExcludedWorkTypes 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSetExcludedWorkTypes.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetExcludedWorkTypesQuery = {
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

      await contractExclusionSetExcludedWorkTypes.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/query', {
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
    it('should get contractexclusionsetexcludedworktypes by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionSetExcludedWorkTypes' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSetExcludedWorkTypes.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionsetexcludedworktypes successfully', async () => {
      const contractExclusionSetExcludedWorkTypesData = { name: 'New ContractExclusionSetExcludedWorkTypes' };
      const mockResponse = { id: 1, ...contractExclusionSetExcludedWorkTypesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSetExcludedWorkTypes.create(contractExclusionSetExcludedWorkTypesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes', contractExclusionSetExcludedWorkTypesData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsetexcludedworktypes successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractExclusionSetExcludedWorkTypes.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/1');
    });
  });
});