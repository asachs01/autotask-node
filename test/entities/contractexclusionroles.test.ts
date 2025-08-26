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
  ContractExclusionRoles,
  IContractExclusionRoles,
  IContractExclusionRolesQuery,
} from '../../src/entities/contractexclusionroles';

describe('ContractExclusionRoles Entity', () => {
  let contractExclusionRoles: ContractExclusionRoles;
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

    contractExclusionRoles = new ContractExclusionRoles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionroles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionRoles 1' },
        { id: 2, name: 'ContractExclusionRoles 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionRoles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionRoles/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionRolesQuery = {
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

      await contractExclusionRoles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionRoles/query', {
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
    it('should get contractexclusionroles by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionRoles' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionRoles/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionroles successfully', async () => {
      const contractExclusionRolesData = { name: 'New ContractExclusionRoles' };
      const mockResponse = { id: 1, ...contractExclusionRolesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractExclusionRoles.create(contractExclusionRolesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusionRoles', contractExclusionRolesData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionroles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractExclusionRoles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionRoles/1');
    });
  });
});