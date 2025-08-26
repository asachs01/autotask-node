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
  ServiceCalls,
  IServiceCalls,
  IServiceCallsQuery,
} from '../../src/entities/servicecalls';

describe('ServiceCalls Entity', () => {
  let serviceCalls: ServiceCalls;
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

    serviceCalls = new ServiceCalls(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicecalls successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceCalls 1' },
        { id: 2, name: 'ServiceCalls 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCalls.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCalls/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallsQuery = {
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

      await serviceCalls.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCalls/query', {
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
    it('should get servicecalls by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCalls' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCalls.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCalls/1');
    });
  });

  describe('create', () => {
    it('should create servicecalls successfully', async () => {
      const serviceCallsData = { name: 'New ServiceCalls' };
      const mockResponse = { id: 1, ...serviceCallsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCalls.create(serviceCallsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ServiceCalls', serviceCallsData);
    });
  });

  describe('update', () => {
    it('should update servicecalls successfully', async () => {
      const serviceCallsData = { name: 'Updated ServiceCalls' };
      const mockResponse = { id: 1, ...serviceCallsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCalls.update(1, serviceCallsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ServiceCalls/1', serviceCallsData);
    });
  });

  describe('patch', () => {
    it('should partially update servicecalls successfully', async () => {
      const serviceCallsData = { name: 'Patched ServiceCalls' };
      const mockResponse = { id: 1, ...serviceCallsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCalls.patch(1, serviceCallsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ServiceCalls/1', serviceCallsData);
    });
  });

  describe('delete', () => {
    it('should delete servicecalls successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await serviceCalls.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ServiceCalls/1');
    });
  });
});