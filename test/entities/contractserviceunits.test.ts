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
  ContractServiceUnits,
  IContractServiceUnits,
  IContractServiceUnitsQuery,
} from '../../src/entities/contractserviceunits';

describe('ContractServiceUnits Entity', () => {
  let contractServiceUnits: ContractServiceUnits;
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

    contractServiceUnits = new ContractServiceUnits(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractserviceunits successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceUnits 1' },
        { id: 2, name: 'ContractServiceUnits 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceUnits.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceUnits/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceUnitsQuery = {
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

      await contractServiceUnits.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceUnits/query', {
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
    it('should get contractserviceunits by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceUnits' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceUnits.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceUnits/1');
    });
  });

  describe('create', () => {
    it('should create contractserviceunits successfully', async () => {
      const contractServiceUnitsData = { name: 'New ContractServiceUnits' };
      const mockResponse = { id: 1, ...contractServiceUnitsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceUnits.create(contractServiceUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServiceUnits', contractServiceUnitsData);
    });
  });

  describe('update', () => {
    it('should update contractserviceunits successfully', async () => {
      const contractServiceUnitsData = { name: 'Updated ContractServiceUnits' };
      const mockResponse = { id: 1, ...contractServiceUnitsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceUnits.update(1, contractServiceUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractServiceUnits/1', contractServiceUnitsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractserviceunits successfully', async () => {
      const contractServiceUnitsData = { name: 'Patched ContractServiceUnits' };
      const mockResponse = { id: 1, ...contractServiceUnitsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceUnits.patch(1, contractServiceUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractServiceUnits/1', contractServiceUnitsData);
    });
  });

  describe('delete', () => {
    it('should delete contractserviceunits successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractServiceUnits.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractServiceUnits/1');
    });
  });
});