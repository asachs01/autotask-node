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
  ServiceCallTaskResources,
  IServiceCallTaskResources,
  IServiceCallTaskResourcesQuery,
} from '../../src/entities/servicecalltaskresources';

describe('ServiceCallTaskResources Entity', () => {
  let serviceCallTaskResources: ServiceCallTaskResources;
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

    serviceCallTaskResources = new ServiceCallTaskResources(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicecalltaskresources successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceCallTaskResources 1' },
        { id: 2, name: 'ServiceCallTaskResources 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTaskResources.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTaskResources/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IServiceCallTaskResourcesQuery = {
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

      await serviceCallTaskResources.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTaskResources/query', {
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
    it('should get servicecalltaskresources by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceCallTaskResources' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTaskResources.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ServiceCallTaskResources/1');
    });
  });

  describe('create', () => {
    it('should create servicecalltaskresources successfully', async () => {
      const serviceCallTaskResourcesData = { name: 'New ServiceCallTaskResources' };
      const mockResponse = { id: 1, ...serviceCallTaskResourcesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await serviceCallTaskResources.create(serviceCallTaskResourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ServiceCallTaskResources', serviceCallTaskResourcesData);
    });
  });

  describe('delete', () => {
    it('should delete servicecalltaskresources successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await serviceCallTaskResources.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ServiceCallTaskResources/1');
    });
  });
});