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
  Contracts,
  IContracts,
  IContractsQuery,
} from '../../src/entities/contracts';

describe('Contracts Entity', () => {
  let contracts: Contracts;
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

    contracts = new Contracts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contracts successfully', async () => {
      const mockData = [
        { id: 1, name: 'Contracts 1' },
        { id: 2, name: 'Contracts 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contracts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Contracts/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        },
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractsQuery = {
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

      await contracts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/Contracts/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  describe('get', () => {
    it('should get contracts by id', async () => {
      const mockData = { id: 1, name: 'Test Contracts' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contracts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/Contracts/1');
    });
  });

  describe('create', () => {
    it('should create contracts successfully', async () => {
      const contractsData = { name: 'New Contracts' };
      const mockResponse = { id: 1, ...contractsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contracts.create(contractsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/Contracts', contractsData);
    });
  });

  describe('update', () => {
    it('should update contracts successfully', async () => {
      const contractsData = { name: 'Updated Contracts' };
      const mockResponse = { id: 1, ...contractsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contracts.update(1, contractsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/Contracts/1', contractsData);
    });
  });

  describe('patch', () => {
    it('should partially update contracts successfully', async () => {
      const contractsData = { name: 'Patched Contracts' };
      const mockResponse = { id: 1, ...contractsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contracts.patch(1, contractsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/Contracts/1',
        contractsData
      );
    });
  });
});
