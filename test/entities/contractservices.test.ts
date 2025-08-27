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
  ContractServices,
  IContractServices,
  IContractServicesQuery,
} from '../../src/entities/contractservices';

describe('ContractServices Entity', () => {
  let contractServices: ContractServices;
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

    contractServices = new ContractServices(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservices successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServices 1' },
        { id: 2, name: 'ContractServices 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServices.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServices/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServicesQuery = {
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

      await contractServices.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServices/query', {
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
    it('should get contractservices by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServices' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServices.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServices/1');
    });
  });

  describe('create', () => {
    it('should create contractservices successfully', async () => {
      const contractServicesData = { name: 'New ContractServices' };
      const mockResponse = { id: 1, ...contractServicesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractServices.create(contractServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServices', contractServicesData);
    });
  });

  describe('update', () => {
    it('should update contractservices successfully', async () => {
      const contractServicesData = { name: 'Updated ContractServices' };
      const mockResponse = { id: 1, ...contractServicesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServices.update(1, contractServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractServices/1', contractServicesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractservices successfully', async () => {
      const contractServicesData = { name: 'Patched ContractServices' };
      const mockResponse = { id: 1, ...contractServicesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractServices.patch(1, contractServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractServices/1', contractServicesData);
    });
  });

  describe('delete', () => {
    it('should delete contractservices successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractServices.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractServices/1');
    });
  });
});