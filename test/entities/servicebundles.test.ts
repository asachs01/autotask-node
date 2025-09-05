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
  ServiceBundles,
  IServiceBundles,
  IServiceBundlesQuery,
} from '../../src/entities/servicebundles';

describe('ServiceBundles Entity', () => {
  let serviceBundles: ServiceBundles;
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

    serviceBundles = new ServiceBundles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list servicebundles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ServiceBundles 1' },
        { id: 2, name: 'ServiceBundles 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await serviceBundles.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceBundles/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IServiceBundlesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await serviceBundles.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceBundles/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get servicebundles by id', async () => {
      const mockData = { id: 1, name: 'Test ServiceBundles' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await serviceBundles.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ServiceBundles/1');
    });
  });

  describe('create', () => {
    it('should create servicebundles successfully', async () => {
      const serviceBundlesData = { name: 'New ServiceBundles' };
      const mockResponse = { id: 1, ...serviceBundlesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await serviceBundles.create(serviceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ServiceBundles', serviceBundlesData);
    });
  });

  describe('update', () => {
    it('should update servicebundles successfully', async () => {
      const serviceBundlesData = { name: 'Updated ServiceBundles' };
      const mockResponse = { id: 1, ...serviceBundlesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await serviceBundles.update(1, serviceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ServiceBundles/1', serviceBundlesData);
    });
  });

  describe('patch', () => {
    it('should partially update servicebundles successfully', async () => {
      const serviceBundlesData = { name: 'Patched ServiceBundles' };
      const mockResponse = { id: 1, ...serviceBundlesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await serviceBundles.patch(1, serviceBundlesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ServiceBundles/1', serviceBundlesData);
    });
  });
});