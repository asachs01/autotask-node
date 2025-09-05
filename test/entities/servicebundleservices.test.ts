import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import {
  ServiceBundleServices,
  IServiceBundleServices,
  IServiceBundleServicesQuery,
} from '../../src/entities/servicebundleservices';

describe('ServiceBundleServices Entity', () => {
  let serviceBundleServices: ServiceBundleServices;
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

    serviceBundleServices = new ServiceBundleServices(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicebundleservices successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceBundleServices 1' },
        { id: 2, name: 'ServiceBundleServices 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await serviceBundleServices.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceBundleServices/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IServiceBundleServicesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await serviceBundleServices.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceBundleServices/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get servicebundleservices by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceBundleServices' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await serviceBundleServices.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceBundleServices/1');
    });
  });

  describe('create', () => {
    it('should create servicebundleservices successfully', async () => {
      const serviceBundleServicesData = { name: 'New ServiceBundleServices' };
      const mockResponse = { id: 1, ...serviceBundleServicesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await serviceBundleServices.create(serviceBundleServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ServiceBundleServices', serviceBundleServicesData);
    });
  });

  describe('delete', () => {
    it('should delete servicebundleservices successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await serviceBundleServices.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ServiceBundleServices/1');
    });
  });
});