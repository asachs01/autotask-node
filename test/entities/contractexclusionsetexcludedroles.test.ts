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
  ContractExclusionSetExcludedRoles,
  IContractExclusionSetExcludedRoles,
  IContractExclusionSetExcludedRolesQuery,
} from '../../src/entities/contractexclusionsetexcludedroles';

describe('ContractExclusionSetExcludedRoles Entity', () => {
  let contractExclusionSetExcludedRoles: ContractExclusionSetExcludedRoles;
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

    contractExclusionSetExcludedRoles = new ContractExclusionSetExcludedRoles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsetexcludedroles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSetExcludedRoles 1' },
        { id: 2, name: 'ContractExclusionSetExcludedRoles 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSetExcludedRoles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedRoles/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetExcludedRolesQuery = {
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

      await contractExclusionSetExcludedRoles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedRoles/query', {
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
    it('should get contractexclusionsetexcludedroles by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionSetExcludedRoles' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSetExcludedRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedRoles/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionsetexcludedroles successfully', async () => {
      const contractExclusionSetExcludedRolesData = { name: 'New ContractExclusionSetExcludedRoles' };
      const mockResponse = { id: 1, ...contractExclusionSetExcludedRolesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionSetExcludedRoles.create(contractExclusionSetExcludedRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusionSetExcludedRoles', contractExclusionSetExcludedRolesData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsetexcludedroles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractExclusionSetExcludedRoles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionSetExcludedRoles/1');
    });
  });
});