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
  ContractServiceBundleUnits,
  IContractServiceBundleUnits,
  IContractServiceBundleUnitsQuery,
} from '../../src/entities/contractservicebundleunits';

describe('ContractServiceBundleUnits Entity', () => {
  let contractServiceBundleUnits: ContractServiceBundleUnits;
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

    contractServiceBundleUnits = new ContractServiceBundleUnits(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservicebundleunits successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceBundleUnits 1' },
        { id: 2, name: 'ContractServiceBundleUnits 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleUnits.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleUnits/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceBundleUnitsQuery = {
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

      await contractServiceBundleUnits.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleUnits/query', {
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
    it('should get contractservicebundleunits by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceBundleUnits' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleUnits.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleUnits/1');
    });
  });

  describe('create', () => {
    it('should create contractservicebundleunits successfully', async () => {
      const contractServiceBundleUnitsData = { name: 'New ContractServiceBundleUnits' };
      const mockResponse = { id: 1, ...contractServiceBundleUnitsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleUnits.create(contractServiceBundleUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServiceBundleUnits', contractServiceBundleUnitsData);
    });
  });

  describe('update', () => {
    it('should update contractservicebundleunits successfully', async () => {
      const contractServiceBundleUnitsData = { name: 'Updated ContractServiceBundleUnits' };
      const mockResponse = { id: 1, ...contractServiceBundleUnitsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleUnits.update(1, contractServiceBundleUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractServiceBundleUnits/1', contractServiceBundleUnitsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractservicebundleunits successfully', async () => {
      const contractServiceBundleUnitsData = { name: 'Patched ContractServiceBundleUnits' };
      const mockResponse = { id: 1, ...contractServiceBundleUnitsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServiceBundleUnits.patch(1, contractServiceBundleUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractServiceBundleUnits/1', contractServiceBundleUnitsData);
    });
  });

  describe('delete', () => {
    it('should delete contractservicebundleunits successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractServiceBundleUnits.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractServiceBundleUnits/1');
    });
  });
});